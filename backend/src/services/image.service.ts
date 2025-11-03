import sharp from 'sharp';
import { ImageFormat } from '@prisma/client';
import { storageService } from './storage.service';

type SharpMetadata = Pick<sharp.Metadata, 'width' | 'height'> & {
  format: ImageFormat;
};

/**
 * Gets image metadata from S3 object
 * @param storageKey - The S3 object key
 * @returns Image metadata (width, height, format)
 * @throws Error if metadata is invalid or unsupported format, or if retrieval fails
 */
export const getImageMetadata = async (
  storageKey: string
): Promise<SharpMetadata> => {
  // Get the image buffer from storage
  const buffer = await storageService.getObject(storageKey);

  // Get image metadata using sharp
  const metadata = await sharp(buffer).metadata();

  if (!metadata.width || !metadata.height || !metadata.format) {
    throw new Error('Invalid image metadata');
  }

  // Map sharp format to Prisma ImageFormat enum
  let format: ImageFormat;
  switch (metadata.format) {
    case 'jpeg':
    case 'jpg':
      format = ImageFormat.jpeg;
      break;
    case 'png':
      format = ImageFormat.png;
      break;
    case 'webp':
      format = ImageFormat.webp;
      break;
    default:
      throw new Error(`Unsupported image format: ${metadata.format}`);
  }

  return {
    width: metadata.width,
    height: metadata.height,
    format,
  };
};

export const imageService = {
  getImageMetadata,
};
