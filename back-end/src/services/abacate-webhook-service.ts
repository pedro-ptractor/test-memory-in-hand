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

      if (data.pixQrCode.status === 'PAID') {
        await paymentRepository.updateStatus(payment.id, {
          status: 'PAID',
          paidAt: new Date(),
          expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        });

        await subscriptionRepository.activate(payment.subscriptionId);
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
