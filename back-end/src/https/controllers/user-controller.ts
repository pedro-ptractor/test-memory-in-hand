import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { UserService } from '../../services/user-service.js';

const userService = new UserService();

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(6),
    planId: z.string(),
    phone: z.string(),
    cpf: z.string(),
  });

  const { name, email, password, planId, phone, cpf } = bodySchema.parse(
    request.body,
  );

  const result = await userService.register({
    name,
    email,
    password,
    planId,
    phone,
    cpf,
  });

  return reply.status(201).send({ result });
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
