import {
  Prisma,
  PrismaClient,
  type User,
} from '../../generated/prisma/client.js';

export class UserPrismaRepository {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    cpf: string;
  }) {
    return await this.prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        role: true,
        createdAt: true,
        addresses: {
          select: {
            zipCode: true,
          },
        },
      },
    });
  }
}
