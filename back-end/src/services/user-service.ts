import bcrypt from 'bcrypt';
import { UserPrismaRepository } from '../repositories/prisma/user-prisma-repository.js';
import { prisma } from '../lib/prisma.js';
import { SubscriptionPrismaRepository } from '../repositories/prisma/subscription-prisma-repository.js';
import { abacatePay } from '../lib/abacatepay.js';
import { PaymentPrismaRepository } from '../repositories/prisma/payment-prisma-repository.js';
import type { $Enums } from '../generated/prisma/client.js';
import { PlanPricePrismaRepository } from '../repositories/prisma/plan-price-prisma-repository.js';
import { NotFoundSubscription } from './erros/subscription-errors.js';

export class UserService {
  async cancelSubscription({ userId }: { userId: string }) {
    const subscriptionRepository = new SubscriptionPrismaRepository(prisma);

    const subscription =
      await subscriptionRepository.findByUserIdAndActive(userId);

    if (!subscription) {
      throw new NotFoundSubscription();
    }

    const statusSubscription = await subscriptionRepository.cancel(
      subscription.id,
    );

    return statusSubscription;
  }

  async register({
    name,
    email,
    password,
    phone,
    cpf,
    planId,
    billingCycle,
  }: {
    name: string;
    email: string;
    password: string;
    phone: string;
    cpf: string;
    planId: string;
    billingCycle: $Enums.BillingCycle;
  }) {
    const { userCreate, plan, subscription } = await prisma.$transaction(
      async (tx) => {
        const userRepository = new UserPrismaRepository(tx);
        const planPriceRepository = new PlanPricePrismaRepository(tx);
        const subscriptionRepository = new SubscriptionPrismaRepository(tx);

        const user = await userRepository.findByEmail(email);

        if (user) {
          throw new Error('Email already in use');
        }

        const plan = await planPriceRepository.findByPlanAndCycle(
          planId,
          billingCycle,
        );

        if (!plan) {
          throw new Error('Plan not found');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userCreate = await userRepository.create({
          name,
          email,
          password: hashedPassword,
          phone,
          cpf,
        });

        const subscription = await subscriptionRepository.create({
          userId: userCreate.id,
          planId: plan.planId,
          status: 'PENDING',
          billingCycle,
        });

        return { userCreate, subscription, plan };
      },
    );

    const checkout = await abacatePay.createPix({
      customer: {
        name: userCreate.name,
        email: userCreate.email,
        cellphone: userCreate.phone,
        cpf: userCreate.cpf,
      },
      //eu preciso validar essa transformação, preciso sempre lidar com centavos
      amount: Math.round(plan.price.toNumber() * 100),
      externalReference: subscription.id,
    });

    const paymentRepository = new PaymentPrismaRepository(prisma);

    const payment = await paymentRepository.create({
      gatewayPaymentId: checkout.data.id,
      amountInCents: Math.round(plan.price.toNumber() * 100),
      status: 'PENDING',
      subscriptionId: subscription.id,
      pixCode: checkout.data.brCode,
      pixQrCodeBase64: checkout.data.brCodeBase64,
      expiresAt: checkout.data.expiresAt,
    });

    console.log(checkout);

    //mais pra frente eu vou ter que lidar com falhas referente á por exemplo, se tiver um problema
    //no gatway de pagamento, eu cancelo eu cancelo payment e outras estratégias referente a isso.
    return {
      subscriptionId: subscription.id,
      paymentId: payment.id,
      pix: {
        copyPaste: checkout.data.brCode,
        qrCodeBase64: checkout.data.brCodeBase64,
      },
    };
  }

  async login(email: string, password: string) {
    const userRepository = new UserPrismaRepository(prisma);

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
