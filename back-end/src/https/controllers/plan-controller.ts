import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { PlanService } from '../../services/plan-service.js';
import { $Enums } from '../../generated/prisma/client.js';

const planService = new PlanService();

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    name: z.string(),
    price: z.number(),
    photoLimit: z.number(),
    cycle: z.enum($Enums.BillingCycle),
  });

  const { name, price, photoLimit, cycle } = bodySchema.parse(request.body);

  const plan = await planService.create({ name, price, photoLimit, cycle });
  return reply.status(201).send(plan);
}
