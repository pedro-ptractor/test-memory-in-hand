import { prisma } from '../lib/prisma.js';
import { SubscriptionPrismaRepository } from '../repositories/prisma/subscription-prisma-repository.js';

export class SubscriptionService {
  async resolveUserAccess({ userId }: { userId: string }) {
    const subscriptionRepository = new SubscriptionPrismaRepository(prisma);

    const subscription =
      await subscriptionRepository.findSubscriptionToUserAcess({ userId });

    if (!subscription) {
      return {
        status: 'NONE',
        actionRequired: 'CREATE_SUBSCRIPTION',
      };
    }

    if (subscription.status === 'ACTIVE') {
      return {
        status: 'ACTIVE',
        actionRequired: null,
      };
    }

    if (subscription.status === 'PENDING') {
      const payment = subscription.payments[0];

      if (!payment) {
        return {
          status: 'PENDING',
          actionRequired: 'GENERATE_PAYMENT',
        };
      }

      if (payment.status === 'PENDING') {
        if (payment.expiresAt && payment.expiresAt > new Date()) {
          return {
            status: 'PENDING',
            actionRequired: 'SHOW_PIX',
            paymentId: payment.id,
            pix: {
              copyPaste: payment.pixCode,
              qrCodeBase64: payment.pixQrCodeBase64,
            },
          };
        }

        return {
          status: 'PENDING',
          actionRequired: 'RETRY_PAYMENT',
        };
      }
      if (payment.status === 'EXPIRED' || payment.status === 'CANCELED') {
        return {
          status: 'PENDING',
          actionRequired: 'RETRY_PAYMENT',
        };
      }
    }

    return {
      status: subscription.status,
      actionRequired: 'CREATE_SUBSCRIPTION',
    };
  }
}
