import { prisma } from '../lib/prisma.js';
import { PaymentPrismaRepository } from '../repositories/prisma/payment-prisma-repository.js';
import { SubscriptionPrismaRepository } from '../repositories/prisma/subscription-prisma-repository.js';

export class AbacateWebhookService {
  async handleBillingPaid({
    data,
    event,
  }: {
    data: {
      pixQrCode: {
        id: string;
        amount: number;
        kind: string;
        status: string;
      };
      payment: {
        amount: number;
        fee: number;
        method: string;
      };
    };
    event: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const paymentRepository = new PaymentPrismaRepository(tx);
      const subscriptionRepository = new SubscriptionPrismaRepository(tx);

      const payment = await paymentRepository.findByGatewayId(
        data.pixQrCode.id,
      );

      if (!payment) {
        throw new Error('Payment not found');
      }
      // 🔒 Idempotência
      if (payment.status === 'PAID') {
        return { message: 'Already processed' };
      }

      const subscription = await subscriptionRepository.findById(
        payment.subscriptionId,
      );

      if (!subscription) {
        throw new Error('Assinature not found');
      }

      if (data.pixQrCode.status === 'PAID') {
        const endDate = new Date();

        endDate.setMonth(
          endDate.getMonth() +
            (subscription.billingCycle === 'ANNUAL' ? 12 : 1),
        );

        await paymentRepository.updateStatus(payment.id, {
          status: 'PAID',
          paidAt: new Date(),
          expiresAt: endDate,
        });

        await subscriptionRepository.activate(payment.subscriptionId, endDate);
      }

      if (data.pixQrCode.status === 'EXPIRED') {
        await paymentRepository.updateStatus(payment.id, {
          status: 'EXPIRED',
        });

        await subscriptionRepository.expire(payment.subscriptionId);
      }

      return { success: true };
    });
  }
}
