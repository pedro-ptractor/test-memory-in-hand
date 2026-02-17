import type { FastifyInstance } from 'fastify';
import {
  create,
  editPhotoPack,
  getPhotoPacks,
  getPhotoPacksByUser,
  getUniquePhotoPack,
} from '../controllers/photo-pack-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { ensureActiveSubscription } from '../../middlewares/auth-active-subscription-middleware.js';
import { adminMiddleware } from '../../middlewares/auth-adm-middleware.js';

export async function photoPackRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [authMiddleware, ensureActiveSubscription],
    },
    create,
  );

  app.get(
    '/',
    {
      preHandler: [authMiddleware, ensureActiveSubscription],
    },
    getPhotoPacksByUser,
  );

  app.get(
    '/all',
    {
      preHandler: [authMiddleware, adminMiddleware],
    },
    getPhotoPacks,
  );

  app.get(
    '/:packPhotoId',
    {
      preHandler: [authMiddleware, adminMiddleware],
    },
    getUniquePhotoPack,
  );

  app.put(
    '/:packPhotoId',
    {
      preHandler: [authMiddleware, adminMiddleware],
    },
    editPhotoPack,
  );
}
