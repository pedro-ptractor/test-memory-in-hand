import type {
  $Enums,
  Payment,
  Prisma,
  PrismaClient,
} from '../../generated/prisma/client.js';

export class PaymentPrismaRepository {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async findByGatewayId(gatewayPaymentId: string): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: { gatewayPaymentId },
    });
  }

  async updateStatus(
    paymentId: string,
    data: Partial<Payment>,
  ): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data,
    });
  }

  async findPaymentById(paymentId: string): Promise<Payment | null> {
    return await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
  }

  async expirePendingBySubscription({
    subscriptionId,
  }: {
    subscriptionId: string;
  }) {
    await this.prisma.payment.updateMany({
      where: {
        subscriptionId,
        status: 'PENDING',
      },
      data: {
        status: 'EXPIRED',
      },
    });
  }

  async create(data: {
    gatewayPaymentId: string;
    amountInCents: number;
    status: $Enums.PaymentStatus;
    subscriptionId: string;
    pixCode: string;
    pixQrCodeBase64: string;
    expiresAt: Date;
  }): Promise<Payment> {
    return await this.prisma.payment.create({
      data: {
        ...data,
      },
    });
  }
}
