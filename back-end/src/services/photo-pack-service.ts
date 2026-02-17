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
  NotFilesUploaded,
} from './erros/photo-pack-errors.js';
import { PhotoLimitExceeded } from './erros/photo-errors.js';

export class PhotoPackService {
  async create({ userId, files }: { userId: string; files: any[] }) {
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
