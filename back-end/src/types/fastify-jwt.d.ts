import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: string;
      role: 'USER' | 'ADMIN';
      id: string;
    };
  }
}
