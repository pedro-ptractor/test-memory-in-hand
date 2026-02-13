import type { FastifyInstance } from 'fastify';
import { response } from '../controllers/abacatepay/abacate-webhook-controller.js';
import { simulatePayment } from '../controllers/abacatepay/abacate-controller.js';

export async function webHookRoutes(app: FastifyInstance) {
  app.post('/abacatepay', response);
  app.post('/simulate', simulatePayment);
}
