import { Router } from 'express';
import { presignController } from './presign.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { presignRequestSchema } from './presign.validation';

const presignRouter = Router();

/**
 * POST /api/presign
 * Generate a presigned URL for uploading images
 */
presignRouter.post(
  '/presign',
  validateRequest(presignRequestSchema, 'body'),
  presignController
);

export default presignRouter;
