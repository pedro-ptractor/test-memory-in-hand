import type {
  Plan,
  Prisma,
  PrismaClient,
} from '../../generated/prisma/client.js';

export class PlanPrismaRepository {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async findPlanById(planId: string): Promise<Plan | null> {
    return await this.prisma.plan.findUnique({
      where: { id: planId },
    });
  }

  async create(data: {
    name: string;
    price: number;
    photoLimit: number;
  }): Promise<Plan> {
    return await this.prisma.plan.create({
      data: {
        ...data,
      },
    });
  }
}
