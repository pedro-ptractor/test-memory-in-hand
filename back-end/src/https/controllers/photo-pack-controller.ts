import type { FastifyReply, FastifyRequest } from 'fastify';
import { file, z } from 'zod';
import { UserService } from '../../services/user-service.js';
import { $Enums } from '../../generated/prisma/client.js';

// const userService = new UserService();

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const { sub: userId } = request.user;

  const parts = request.parts();

  const files: any[] = [];

  try {
    for await (const part of parts) {
      if (part.type === 'file') {
        files.push(part);
      }
    }

    if (files.length === 0) {
      reply.status(400).send({
        message: 'Not files uploaded',
      });
    }
    console.log(files, userId);
    reply.send({ status: true });
  } catch (error) {
    reply.status(500).send({
      message: error,
    });
  }
}
