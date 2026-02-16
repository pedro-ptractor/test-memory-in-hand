import type {
  MonthlyCycle,
  PhotoPack,
  Prisma,
  PrismaClient,
} from '../../generated/prisma/client.js';

//Terminar de criar o repository para criar verificar se existe, updated também
export class PhotoPackPrismaRepository {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  //   async find(data: {
  //     year: number;
  //     month: number;
  //   }): Promise<MonthlyCycle | null> {
  //     return await this.prisma.monthlyCycle.findFirst({
  //       where: {
  //         month: data.month,
  //         year: data.year,
  //       },
  //     });
  //   }

  async create(data: {
    userId: string;
    monthlyCycleId: string;
  }): Promise<PhotoPack> {
    return await this.prisma.photoPack.create({
      data: {
        ...data,
      },
    });
  }
}
