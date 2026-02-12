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
}
