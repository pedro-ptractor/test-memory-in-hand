import { prisma } from '../lib/prisma.js';
import { PlanPrismaRepository } from '../repositories/prisma/plan-prisma-repository.js';

export class PlanService {
  async create({
    name,
    price,
    photoLimit,
  }: {
    name: string;
    price: number;
    photoLimit: number;
  }) {
    const planRepository = new PlanPrismaRepository(prisma);
    const planCreate = await planRepository.create({ name, price, photoLimit });
    return planCreate;
  }
}
