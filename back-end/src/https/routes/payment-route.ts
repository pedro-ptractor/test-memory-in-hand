import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { retryPayment } from '../controllers/payment-controller.js';

export async function paymentRoutes(app: FastifyInstance) {
  app.post(
    '/retry',
    {
      preHandler: [authMiddleware],
    },
    retryPayment,
  );
}
