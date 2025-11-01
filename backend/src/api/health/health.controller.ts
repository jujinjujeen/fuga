import { Request, Response } from 'express';
import type { ErrorResponse, HealthResponse } from '@f/types/api-schemas';
import prisma from '@f/prismaInstance';

export const healthController = async (
  _req: Request,
  res: Response<HealthResponse | ErrorResponse>
) => {
  await prisma.$queryRaw`SELECT 1`;
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
  return;
};
