//preciso criar o controller para a function retry
import type { FastifyReply, FastifyRequest } from 'fastify';
import { PaymentService } from '../../services/payment-service.js';
import z from 'zod';
import { $Enums } from '../../generated/prisma/client.js';

const paymentService = new PaymentService();

export async function retryPayment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userSchema = z.object({
      sub: z.string(),
      role: z.enum($Enums.Role),
    });

    const { sub: userId } = userSchema.parse(request.user);

    const payment = await paymentService.retryPayment({
      userId,
    });

    return reply.status(200).send({ payment });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
