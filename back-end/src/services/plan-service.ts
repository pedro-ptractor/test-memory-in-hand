import type { $Enums } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { PlanPricePrismaRepository } from '../repositories/prisma/plan-price-prisma-repository.js';
import { PlanPrismaRepository } from '../repositories/prisma/plan-prisma-repository.js';

export class PlanService {
  async create({
    name,
    photoLimit,
    price,
    cycle,
  }: {
    name: string;
    photoLimit: number;
    price: number;
    cycle: $Enums.BillingCycle;
  }) {
    const planRepository = new PlanPrismaRepository(prisma);
    const planPriceRepository = new PlanPricePrismaRepository(prisma);
    const planCreate = await planRepository.create({ name, photoLimit });

    const planPriceCreate = await planPriceRepository.create({
      cycle,
      price,
      planId: planCreate.id,
    });
    return { planCreate, planPriceCreate };
  }
}
