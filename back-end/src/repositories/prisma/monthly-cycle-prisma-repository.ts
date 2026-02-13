import type {
  MonthlyCycle,
  Prisma,
  PrismaClient,
} from '../../generated/prisma/client.js';

export class MonthlyCyclePrismaRepository {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async find(data: {
    year: number;
    month: number;
  }): Promise<MonthlyCycle | null> {
    return await this.prisma.monthlyCycle.findFirst({
      where: {
        month: data.month,
        year: data.year,
      },
    });
  }

  async create(data: { year: number; month: number }): Promise<MonthlyCycle> {
    return await this.prisma.monthlyCycle.create({
      data: {
        ...data,
      },
    });
  }
}
