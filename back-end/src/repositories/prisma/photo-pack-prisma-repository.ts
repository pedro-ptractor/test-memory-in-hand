import type {
  $Enums,
  PhotoPack,
  Prisma,
  PrismaClient,
} from '../../generated/prisma/client.js';

//Terminar de criar o repository para criar verificar se existe, updated também
export class PhotoPackPrismaRepository {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async change({
    packPhotoId,
    data,
  }: {
    packPhotoId: string;
    data: {
      status: $Enums.PackStatus;
      trackingCode: string | null;
      shippingDate: Date | null;
    };
  }) {
    return this.prisma.photoPack.update({
      where: {
        id: packPhotoId,
      },
      data: {
        ...data,
      },
    });
  }

  async findUnique({
    packPhotoId,
  }: {
    packPhotoId: string;
  }): Promise<Prisma.PhotoPackGetPayload<{
    include: {
      photos: {
        select: {
          id: true;
          url: true;
        };
      };
      user: {
        select: {
          id: true;
          name: true;
          email: true;
          phone: true;
          cpf: true;
          addresses: {
            select: {
              recipient: true;
              zipCode: true;
              street: true;
              number: true;
              complement: true;
              district: true;
              city: true;
              state: true;
              createdAt: true;
            };
          };
        };
      };
    };
  }> | null> {
    return await this.prisma.photoPack.findUnique({
      where: {
        id: packPhotoId,
      },
      include: {
        photos: {
          select: {
            id: true,
            url: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
            addresses: {
              select: {
                recipient: true,
                zipCode: true,
                street: true,
                number: true,
                complement: true,
                district: true,
                city: true,
                state: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
  }

  async listByUserId({ userId }: { userId: string }): Promise<
    Prisma.PhotoPackGetPayload<{
      include: {
        photos: true;
      };
    }>[]
  > {
    return await this.prisma.photoPack.findMany({
      where: {
        userId,
      },
      include: {
        photos: true,
      },
    });
  }

  async listAll({ page, limit }: { page: number; limit: number }): Promise<
    Prisma.PhotoPackGetPayload<{
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
            addresses: {
              select: {
                city: true;
                state: true;
              };
            };
          };
        };
      };
    }>[]
  > {
    return await this.prisma.photoPack.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            addresses: {
              select: {
                city: true,
                state: true,
              },
            },
          },
        },
      },
    });
  }

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
