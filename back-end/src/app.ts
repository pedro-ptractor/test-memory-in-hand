import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import { mainRoutes } from './https/routes/main-route.js';
import { env } from './env/index.js';
import path from 'path';
import { HttpError } from './services/erros/http-error.js';

export const app = Fastify({});

app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

//preciso posteriormente dividir em outro arquivo essas configurações
app.register(jwt, {
  secret: env.JWT_SECRET,
});

await app.register(fastifyStatic, {
  root: path.resolve('uploads'),
  prefix: '/uploads/',
});

//preciso posteriormente dividir em outro arquivo essas configurações
app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

app.register(mainRoutes, { prefix: '/api' });

app.setErrorHandler((error, request, reply) => {
  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      error: error.message,
    });
  }

  return reply.status(500).send({
    error: 'Internal server error',
  });
});
