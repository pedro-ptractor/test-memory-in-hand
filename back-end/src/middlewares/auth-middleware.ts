import type { FastifyReply, FastifyRequest } from 'fastify';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify();

    // Aqui está a correção
    const userId = request.user;

    if (!userId) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }
  } catch {
    return reply.status(401).send({
      message: 'Unauthorized',
    });
  }
}
