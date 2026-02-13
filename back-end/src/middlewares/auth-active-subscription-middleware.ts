import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { SubscriptionPrismaRepository } from '../repositories/prisma/subscription-prisma-repository.js';

export async function ensureActiveSubscription(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sub } = request.user;

  console.log(sub);
  if (!sub) {
    return reply.status(401).send({
      error: 'Unauthorized',
    });
  }

  const subscriptionRepository = new SubscriptionPrismaRepository(prisma);

  const subscription = await subscriptionRepository.findByUserIdAndActive(sub);

  if (!subscription) {
    return reply.status(403).send({
      error: 'Your subscription is inactive or expired.',
    });
  }

  return;
}
