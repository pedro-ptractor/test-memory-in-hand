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

  // function para listar os packs para usuário
  app.get(
    '/',
    {
      preHandler: [authMiddleware, ensureActiveSubscription],
    },
    getPhotoPacksByUser,
  );

  //rota para conseguirmos enxergar os packs para produção
  app.get(
    '/all',
    {
      preHandler: [authMiddleware, adminMiddleware],
    },
    getPhotoPacks,
  );

  // pegar as informações esp de um unico pack
  app.get(
    '/:packPhotoId',
    {
      preHandler: [authMiddleware, adminMiddleware],
    },
    getUniquePhotoPack,
  );

  //atualizar o status ou adicionar código de entraga e etc..
  app.put(
    '/:packPhotoId',
    {
      preHandler: [authMiddleware, adminMiddleware],
    },
    editPhotoPack,
  );
}
