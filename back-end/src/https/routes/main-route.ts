import type { FastifyInstance } from 'fastify';
import { userRoutes } from './user-route.js';
import { planRoutes } from './plan-route.js';
import { webHookRoutes } from './webhook-routes.js';

export async function mainRoutes(app: FastifyInstance) {
  app.register(userRoutes, { prefix: '/users' });
  app.register(planRoutes, { prefix: '/plans' });
  app.register(webHookRoutes, { prefix: '/webhooks' });
}
