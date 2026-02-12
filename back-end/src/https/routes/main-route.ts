import type { FastifyInstance } from 'fastify';
import { userRoutes } from './user-route.js';

export async function mainRoutes(app: FastifyInstance) {
  app.register(userRoutes, { prefix: '/users' });
}
