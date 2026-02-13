import type {
  $Enums,
  Prisma,
  PrismaClient,
  Subscription,
} from '../../generated/prisma/client.js';

export class SubscriptionPrismaRepository {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async create({
    userId,
    planId,
    status,
  }: {
    userId: string;
    planId: string;
    status: $Enums.SubscriptionStatus;
  }): Promise<Subscription> {
    return await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status,
      },
    });
  }

  async activate(subscriptionId: string) {
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
    });
  }

  async expire(subscriptionId: string) {
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'EXPIRED',
      },
    });
  }
}
