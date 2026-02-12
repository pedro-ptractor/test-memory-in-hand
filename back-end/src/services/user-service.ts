import bcrypt from 'bcrypt';
import { UserPrismaRepository } from '../repositories/prisma/user-prisma-repository.js';
import { PlanPrismaRepository } from '../repositories/prisma/plan-prisma-repository.js';
import { prisma } from '../lib/prisma.js';
import { SubscriptionPrismaRepository } from '../repositories/prisma/subscription-prisma-repository.js';

export class UserService {
  async register(
    name: string,
    email: string,
    password: string,
    planId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const userRepository = new UserPrismaRepository(tx);
      const planRepository = new PlanPrismaRepository(tx);
      const subscriptionRepository = new SubscriptionPrismaRepository(tx);

      const user = await userRepository.findByEmail(email);

      if (user) {
        throw new Error('Email already in use');
      }

      const plan = await planRepository.findPlanById(planId);

      if (!plan) {
        throw new Error('Plan not found');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userCreate = await userRepository.create({
        name,
        email,
        password: hashedPassword,
      });

      await subscriptionRepository.create({
        userId: userCreate.id,
        planId: plan.id,
        status: 'PENDING',
      });

      return userCreate;
    });
  }

  async login(email: string, password: string) {
    const userRepository = new UserPrismaRepository(prisma);

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
