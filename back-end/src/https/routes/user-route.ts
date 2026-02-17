import type { FastifyInstance } from 'fastify';
import {
  cancelSubscription,
  login,
  register,
} from '../controllers/user-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { ensureActiveSubscription } from '../../middlewares/auth-active-subscription-middleware.js';

export async function userRoutes(app: FastifyInstance) {
  app.post('/register', register);
  app.post('/login', login);
  app.patch(
    '/cancel',
    {
      preHandler: [authMiddleware, ensureActiveSubscription],
    },
    cancelSubscription,
  );
}
