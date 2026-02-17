import type { FastifyReply, FastifyRequest } from 'fastify';
import { PhotoPackService } from '../../services/photo-pack-service.js';
import { NotFilesUploaded } from '../../services/erros/photo-pack-errors.js';

const photoPackService = new PhotoPackService();

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const { sub: userId } = request.user;

  const parts = request.parts();

  const files: any[] = [];

  for await (const part of parts) {
    if (part.type === 'file') {
      files.push(part);

      await part.toBuffer(); // consumir o stream
    }
  }

  if (files.length === 0) {
    throw new NotFilesUploaded();
  }
  console.log(files);

  const photos = await photoPackService.create({ userId, files });

  reply.status(201).send({ photos });
}
