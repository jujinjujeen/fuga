import { Request, Response } from 'express';
import { storageService } from '../../services/storage.service';
import { PresignRequest } from './presign.validation';

/**
 * POST /api/presign
 * Generates a presigned URL for image upload
 *
 * @param req - Express request with validated body
 * @param res - Express response
 */
export const presignController = async (
  req: Request<object, object, PresignRequest>,
  res: Response
) => {
  try {
    const { fileName, fileType, fileSize } = req.body;

    const result = await storageService.generatePresignedUploadUrl(
      fileName,
      fileType,
      fileSize
    );

    res.status(200).json({
      url: result.url,
      storageKey: result.storageKey,
      fields: result.fields,
    });
  } catch (error) {
    console.error('Presign error:', error);

    const message =
      error instanceof Error ? error.message : 'Failed to generate upload URL';

    res.status(400).json({
      title: 'Upload URL Generation Failed',
      message,
    });
  }
};
