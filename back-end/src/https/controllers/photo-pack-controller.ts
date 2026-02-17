import type { FastifyReply, FastifyRequest } from 'fastify';
import { PhotoPackService } from '../../services/photo-pack-service.js';
import { NotFilesUploaded } from '../../services/erros/photo-pack-errors.js';
import type { MultipartFile } from '@fastify/multipart';
import z from 'zod';
import { $Enums } from '../../generated/prisma/client.js';

const photoPackService = new PhotoPackService();

export async function editPhotoPack(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    //a ideia aqui é sempre pegar o valor original + o que foi alterado e passar para atualizar.
    const bodySchema = z.object({
      status: z.enum($Enums.PackStatus),
      trackingCode: z.string().nullable(),
      shippingDate: z.date().nullable(),
    });
    const paramsSchema = z.object({
      packPhotoId: z.string(),
    });

    const { packPhotoId } = paramsSchema.parse(request.params);

    const data = bodySchema.parse(request.body);

    const pack = await photoPackService.editPackPhoto({
      packPhotoId,
      data,
    });

    reply.send({ pack });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUniquePhotoPack(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    packPhotoId: z.string(),
  });

  const { packPhotoId } = paramsSchema.parse(request.params);

  try {
    const pack = await photoPackService.listUniquePackPhoto({ packPhotoId });

    reply.send({ pack });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getPhotoPacks(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
  });

  const { page, limit } = querySchema.parse(request.query);
  try {
    const packs = await photoPackService.listPacksPhotoAdmin({
      page,
      limit,
    });

    reply.send({ packs });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getPhotoPacksByUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userSchema = z.object({
    sub: z.string(),
  });

  const { sub: userId } = userSchema.parse(request.user);

  try {
    const packs = await photoPackService.listPacksPhotos({ userId });

    reply.send({ packs });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const userSchema = z.object({
    sub: z.string(),
  });

  const { sub: userId } = userSchema.parse(request.user);

  const parts = request.parts();

  const files: MultipartFile[] = [];

  for await (const part of parts) {
    if (part.type === 'file') {
      files.push(part);

      await part.toBuffer();
    }
  }

  if (files.length === 0) {
    throw new NotFilesUploaded();
  }

  const photos = await photoPackService.create({ userId, files });

  reply.status(201).send({ photos });
}
