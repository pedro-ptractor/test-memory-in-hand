import type { FastifyInstance } from 'fastify';
import { create } from '../controllers/photo-pack-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { ensureActiveSubscription } from '../../middlewares/auth-active-subscription-middleware.js';

export async function photoPackRoutes(app: FastifyInstance) {
  //preciso adicionar os middlewares para verificar se é um user, e se está válido
  app.post(
    '/',
    {
      preHandler: [authMiddleware, ensureActiveSubscription],
    },
    create,
  );
}
