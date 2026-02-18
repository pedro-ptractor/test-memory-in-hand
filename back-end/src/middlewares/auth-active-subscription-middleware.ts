import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function ensureActiveSubscription(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sub } = request.user;

  if (!sub) {
    return reply.status(401).send({
      code: 'UNAUTHORIZED',
    });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { userId: sub },
    orderBy: { createdAt: 'desc' },
    include: {
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!subscription || subscription.status !== 'ACTIVE') {
    let actionRequired = 'CREATE_SUBSCRIPTION';

    if (subscription?.status === 'PENDING') {
      const latestPayment = subscription.payments[0];

      if (!latestPayment) {
        actionRequired = 'GENERATE_PAYMENT';
      }

      if (latestPayment?.status === 'PENDING') {
        if (latestPayment.expiresAt && latestPayment.expiresAt < new Date()) {
          actionRequired = 'RETRY_PAYMENT';
        } else {
          actionRequired = 'SHOW_PIX';
        }
      }

      if (
        latestPayment?.status === 'EXPIRED' ||
        latestPayment?.status === 'CANCELED'
      ) {
        actionRequired = 'RETRY_PAYMENT';
      }
    }

    return reply.status(402).send({
      code: 'SUBSCRIPTION_REQUIRED',
      subscriptionStatus: subscription?.status ?? 'NONE',
      actionRequired,
      subscriptionId: subscription?.id ?? null,
    });
  }

  return;
}
