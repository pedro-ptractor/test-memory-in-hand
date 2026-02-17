import { randomUUID } from 'node:crypto';
import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { PhotoPackPrismaRepository } from '../repositories/prisma/photo-pack-prisma-repository.js';
import { MonthlyCyclePrismaRepository } from '../repositories/prisma/monthly-cycle-prisma-repository.js';
import { prisma } from '../lib/prisma.js';
import { SubscriptionPrismaRepository } from '../repositories/prisma/subscription-prisma-repository.js';
import { NotFoundSubscription } from './erros/subscription-errors.js';
import {
  AlreadySubmittedPhotos,
  NotFoundPack,
} from './erros/photo-pack-errors.js';
import { PhotoLimitExceeded } from './erros/photo-errors.js';
import type { MultipartFile } from '@fastify/multipart';
import type { AdminPhotoPackListDTO } from '../types/admin-photo-pack-types.js';
import type { $Enums, Prisma } from '../generated/prisma/client.js';

export class PhotoPackService {
  async editPackPhoto({
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
    const photoPackRepository = new PhotoPackPrismaRepository(prisma);

    const pack = await photoPackRepository.findUnique({ packPhotoId });

    if (!pack) throw new NotFoundPack();

    const editPack = await photoPackRepository.change({
      packPhotoId: pack.id,
      data,
    });

    return editPack;
  }

  async listUniquePackPhoto({ packPhotoId }: { packPhotoId: string }) {
    const photoPackRepository = new PhotoPackPrismaRepository(prisma);

    const pack = await photoPackRepository.findUnique({ packPhotoId });

    if (!pack) throw new NotFoundPack();

    const formattedPack = {
      id: pack.id,
      status: pack.status,
      trackingCode: pack.trackingCode,
      shippingDate: pack.shippingDate,
      createdAt: pack.createdAt,
      photos: pack.photos,
      user: {
        id: pack.user.id,
        name: pack.user.name,
        email: pack.user.email,
        phone: pack.user.phone,
        cpf: pack.user.cpf,
        addresses: pack.user.addresses[0] ? pack.user.addresses[0] : null,
      },
    };

    return formattedPack;
  }

  async listPacksPhotoAdmin({
    page = 1,
    limit = 10,
  }: {
    page?: number;
    limit?: number;
  }) {
    const photoPackRepository = new PhotoPackPrismaRepository(prisma);

    const packs = await photoPackRepository.listAll({
      page,
      limit,
    });

    const formattedPacks: AdminPhotoPackListDTO[] = packs.map((pack) => ({
      id: pack.id,
      status: pack.status,
      trackingCode: pack.trackingCode,
      shippingDate: pack.shippingDate,
      createdAt: pack.createdAt,
      user: {
        id: pack.user.id,
        name: pack.user.name,
        email: pack.user.email,
        city: pack.user.addresses[0] ? pack.user.addresses[0].city : null,
        state: pack.user.addresses[0] ? pack.user.addresses[0].state : null,
      },
    }));

    const total = packs.length;

    return {
      data: formattedPacks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listPacksPhotos({ userId }: { userId: string }) {
    const photoPackRepository = new PhotoPackPrismaRepository(prisma);

    const packs = photoPackRepository.listByUserId({ userId });

    return packs;
  }

  async create({ userId, files }: { userId: string; files: MultipartFile[] }) {
    const subscriptionRepository = new SubscriptionPrismaRepository(prisma);

    const subscription =
      await subscriptionRepository.findByUserIdAndActive(userId);

    if (!subscription) {
      throw new NotFoundSubscription();
    }

    if (files.length > subscription.plan.photoLimit) {
      throw new PhotoLimitExceeded();
    }

    const uploadDir = path.resolve('uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir);
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    return prisma.$transaction(async (tx) => {
      const monthlyCycleRepository = new MonthlyCyclePrismaRepository(tx);
      const photoPackRepository = new PhotoPackPrismaRepository(tx);

      let monthlyCycle = await monthlyCycleRepository.find({ month, year });

      if (!monthlyCycle) {
        monthlyCycle = await monthlyCycleRepository.create({
          month,
          year,
        });
      }

      const existingPack = await tx.photoPack.findFirst({
        where: {
          userId,
          monthlyCycleId: monthlyCycle.id,
        },
      });

      if (existingPack) throw new AlreadySubmittedPhotos();

      const photoPack = await photoPackRepository.create({
        userId,
        monthlyCycleId: monthlyCycle.id,
      });

      const photosToCreate: { url: string; photoPackId: string }[] = [];

      for (const file of files) {
        const fileExt = path.extname(file.filename);
        const fileName = `${randomUUID()}${fileExt}`;
        const filePath = path.join(uploadDir, fileName);

        await new Promise((resolve, reject) => {
          const writeStream = createWriteStream(filePath);
          file.file.pipe(writeStream);
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });

        photosToCreate.push({
          url: `/uploads/${fileName}`,
          photoPackId: photoPack.id,
        });
      }

      await tx.photo.createMany({
        data: photosToCreate,
      });

      return tx.photoPack.findUnique({
        where: { id: photoPack.id },
        include: { photos: true },
      });
    });
  }
}
