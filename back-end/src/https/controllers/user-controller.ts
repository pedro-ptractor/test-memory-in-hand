import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { UserService } from '../../services/user-service.js';
import { $Enums } from '../../generated/prisma/client.js';
import { cpf as CPF } from 'cpf-cnpj-validator';
import { SubscriptionService } from '../../services/subscription-service.js';

const userService = new UserService();
const subscriptionService = new SubscriptionService();

export async function cancelSubscription(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userSchema = z.object({
      sub: z.string(),
      role: z.enum($Enums.Role),
    });

    const { sub: userId } = userSchema.parse(request.user);

    await userService.cancelSubscription({ userId });

    return reply.status(204).send();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const bodySchema = z.object({
      name: z.string(),
      email: z.email(),
      password: z.string().min(6),
      phone: z.string(),
      cpf: z.string().refine((value) => CPF.isValid(value), {
        message: 'CPF not valid',
      }),
      planId: z.string(),
      billingCycle: z.enum($Enums.BillingCycle),
    });

    const { name, email, password, planId, phone, cpf, billingCycle } =
      bodySchema.parse(request.body);

    const result = await userService.register({
      name,
      email,
      password,
      planId,
      phone,
      cpf,
      billingCycle,
    });

    return reply.status(201).send({ result });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    email: z.email(),
    password: z.string(),
  });
  try {
    const { email, password } = bodySchema.parse(request.body);

    const user = await userService.login(email, password);
    const subscriptionState = await subscriptionService.resolveUserAccess({
      userId: user.id,
    });

    const token = await reply.jwtSign(
      { role: user.role },
      {
        sub: user.id,
        expiresIn: '7d',
      },
    );

    return reply.send({ token, subscription: subscriptionState });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
