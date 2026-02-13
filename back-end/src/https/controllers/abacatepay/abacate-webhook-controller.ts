import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AbacateWebhookService } from '../../../services/abacate-webhook-service.js';

const abacateWebHookService = new AbacateWebhookService();

//preciso estudar um pouco melhor essa abordagem do do webhook,
//outras maneiras de lidar, quais outras condições preciso apresentar, e etc
export async function response(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    event: z.string(),
    data: z.object({
      pixQrCode: z.object({
        id: z.string(),
        amount: z.number(),
        kind: z.string(),
        status: z.string(),
      }),
      payment: z.object({
        amount: z.number(),
        fee: z.number(),
        method: z.string(),
      }),
    }),
  });

  const { data, event } = bodySchema.parse(request.body);
  try {
    const result = await abacateWebHookService.handleBillingPaid({
      data,
      event,
    });
    return reply.status(200).send();
  } catch (error) {
    console.log(error);
    return reply.status(200).send();
  }
}
