import type { FastifyReply, FastifyRequest } from 'fastify';
import { PhotoPackService } from '../../services/photo-pack-service.js';

const photoPackService = new PhotoPackService();

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const { sub: userId } = request.user;

  const parts = request.parts();

  const files: any[] = [];

  try {
    for await (const part of parts) {
      if (part.type === 'file') {
        files.push(part);

        await part.toBuffer(); // consumir o stream
      }
    }

    if (files.length === 0) {
      return reply.status(400).send({
        message: 'Not files uploaded',
      });
    }
    console.log(files);

    const photos = await photoPackService.create({ userId, files });

    reply.status(201).send({ photos });
  } catch (error) {
    console.log(error);
    reply.status(500).send({
      message: error,
    });
  }
}
