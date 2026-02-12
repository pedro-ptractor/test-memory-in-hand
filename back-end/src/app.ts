import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import { mainRoutes } from './https/routes/main-route.js';
import { env } from './env/index.js';

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

//preciso posteriormente dividir em outro arquivo essas configurações
app.register(multipart);

app.register(mainRoutes, { prefix: '/api' });
