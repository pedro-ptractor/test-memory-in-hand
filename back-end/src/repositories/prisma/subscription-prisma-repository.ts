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
    billingCycle,
  }: {
    userId: string;
    planId: string;
    status: $Enums.SubscriptionStatus;
    billingCycle: $Enums.BillingCycle;
  }): Promise<Subscription> {
    return await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status,
        billingCycle,
      },
    });
  }

  async findByUserIdAndActive(
    userId: string,
  ): Promise<Prisma.SubscriptionGetPayload<{
    include: {
      plan: true;
    };
  }> | null> {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      include: {
        plan: true,
      },
    });
  }

  async findById(subscriptionId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
  }

  async activate(subscriptionId: string, endDate: Date) {
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        startDate: new Date(),
        endDate,
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

  async cancel(subscriptionId: string) {
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELED',
      },
    });
  }
}
