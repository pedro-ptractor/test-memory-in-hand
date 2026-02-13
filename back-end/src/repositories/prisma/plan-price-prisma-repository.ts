import type {
  $Enums,
  PlanPrice,
  Prisma,
  PrismaClient,
} from '../../generated/prisma/client.js';

export class PlanPricePrismaRepository {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async findByPlanAndCycle(
    planId: string,
    cycle: $Enums.BillingCycle,
  ): Promise<PlanPrice | null> {
    return await this.prisma.planPrice.findFirst({
      where: { planId, cycle },
    });
  }

  async create(data: {
    planId: string;
    price: number;
    cycle: $Enums.BillingCycle;
  }): Promise<PlanPrice> {
    return await this.prisma.planPrice.create({
      data: {
        planId: data.planId,
        price: data.price,
        cycle: data.cycle,
      },
    });
  }
}
