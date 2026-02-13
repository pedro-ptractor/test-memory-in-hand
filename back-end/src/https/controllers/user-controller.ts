import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { UserService } from '../../services/user-service.js';
import { $Enums } from '../../generated/prisma/client.js';

const userService = new UserService();

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(6),
    planId: z.string(),
    phone: z.string(),
    cpf: z.string(),
    billingCycle: z.enum($Enums.BillingCycle),
  });

  const { name, email, password, planId, phone, cpf, billingCycle } =
    bodySchema.parse(request.body);

  try {
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
    reply.status(500).send({ error });
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    email: z.email(),
    password: z.string(),
  });

  const { email, password } = bodySchema.parse(request.body);

  const user = await userService.login(email, password);

  const token = await reply.jwtSign(
    { role: user.role },
    {
      sub: user.id,
      expiresIn: '7d',
    },
  );

  return reply.send({ token });
}
