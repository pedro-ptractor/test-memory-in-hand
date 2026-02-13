import type { FastifyInstance } from 'fastify';
import { create } from '../controllers/plan-controller.js';

export async function planRoutes(app: FastifyInstance) {
  app.post('/', create);
}
