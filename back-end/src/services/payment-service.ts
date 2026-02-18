import { abacatePay } from '../lib/abacatepay.js';
import { prisma } from '../lib/prisma.js';
import { PaymentPrismaRepository } from '../repositories/prisma/payment-prisma-repository.js';
import { PlanPricePrismaRepository } from '../repositories/prisma/plan-price-prisma-repository.js';
import { SubscriptionPrismaRepository } from '../repositories/prisma/subscription-prisma-repository.js';

export class PaymentService {
  async retryPayment({ userId }: { userId: string }) {
    //encontrar subscription, pelo userId, e status === peding
    const subscriptionRepository = new SubscriptionPrismaRepository(prisma);
    const planPriceRepository = new PlanPricePrismaRepository(prisma);

    const subscription = await subscriptionRepository.findByUserIdAndPending({
      userId,
      status: 'PENDING',
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const pendingPayment = subscription.payments.find(
      (p) => p.status === 'PENDING' && p.expiresAt && p.expiresAt > new Date(),
    );

    if (pendingPayment) {
      return {
        paymentId: pendingPayment.id,
        pix: {
          copyPaste: pendingPayment.pixCode,
          qrCodeBase64: pendingPayment.pixQrCodeBase64,
        },
      };
    }

    const planPrice = await planPriceRepository.findByPlanAndCycle(
      subscription.planId,
      subscription.billingCycle,
    );

    if (!planPrice) {
      throw new Error('Plan price not found');
    }

    const checkout = await abacatePay.createPix({
      customer: {
        name: subscription.user.name,
        email: subscription.user.email,
        cellphone: subscription.user.phone,
        cpf: subscription.user.cpf,
      },
      amount: Math.round(planPrice.price.toNumber() * 100),
      externalReference: subscription.id,
    });

    //preciso criar uma function para se tiver algum payment PENDING, e atualizar como expired
    //crio em repository payment
    return await prisma.$transaction(async (tx) => {
      const paymentRepository = new PaymentPrismaRepository(tx);

      await paymentRepository.expirePendingBySubscription({
        subscriptionId: subscription.id,
      });

      const payment = await paymentRepository.create({
        gatewayPaymentId: checkout.data.id,
        amountInCents: Math.round(planPrice.price.toNumber() * 100),
        status: 'PENDING',
        subscriptionId: subscription.id,
        pixCode: checkout.data.brCode,
        pixQrCodeBase64: checkout.data.brCodeBase64,
        expiresAt: checkout.data.expiresAt,
      });

      return {
        subscriptionId: subscription.id,
        paymentId: payment.id,
        pix: {
          copyPaste: checkout.data.brCode,
          qrCodeBase64: checkout.data.brCodeBase64,
        },
      };
    });
  }
}
