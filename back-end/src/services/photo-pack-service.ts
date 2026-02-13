import path from 'path';
import { prisma } from '../lib/prisma.js';
import { SubscriptionPrismaRepository } from '../repositories/prisma/subscription-prisma-repository.js';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { MonthlyCyclePrismaRepository } from '../repositories/prisma/monthly-cycle-prisma-repository.js';

export class PhotoPackService {
  async create({ userId, files }: { userId: string; files: any[] }) {
    const subscriptionRepository = new SubscriptionPrismaRepository(prisma);

    const subscription =
      await subscriptionRepository.findByUserIdAndActive(userId);

    if (!subscription) {
      throw new Error('subscription not found');
    }

    if (files.length > subscription.plan.photoLimit) {
      throw new Error('Photo limit exceeded');
    }

    const uploadDir = path.resolve('uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir);
    }

    const savedPhotos: { url: string }[] = [];

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

      savedPhotos.push({
        url: `/uploads/${fileName}`,
      });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    await prisma.$transaction(async (tx) => {
      const monthlyCycleRepository = new MonthlyCyclePrismaRepository(tx);

      const monthlyCycle = await monthlyCycleRepository.find({ month, year });

      if (!monthlyCycle) {
        const createMonthlyCycle = await monthlyCycleRepository.create({
          month,
          year,
        });

        //preciso terminar de construir esse service que vai criar o photoPack
        // a ideia é enviar as 12 fotos por exemplo, verificar se existe montlyCycle
        //se não tiver criar, ai depois criar o photopack - e registrar as Photo aqui também
      }
    });
  }
}
