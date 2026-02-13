import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';
import { abacatePay } from '../../../lib/abacatepay.js';

export async function simulatePayment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    pixQrCodeId: z.string(),
  });

  const { pixQrCodeId } = bodySchema.parse(request.body);
  console.log(pixQrCodeId);

  try {
    const teste = await abacatePay.simulatePayment({ pixQrCodeId });

    reply.send(teste);
  } catch (error) {
    console.log(error);
    reply.status(500).send({
      message: 'error',
    });
  }
}
