import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { ImageFormat } from '@prisma/client';

const TMP_BUCKET = process.env.S3_TMP_BUCKET || 'tmp';

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

type SharpMetadata = Pick<sharp.Metadata, 'width' | 'height'> & {
  format: ImageFormat;
};

/**
 * Gets image metadata from S3 object
 * @param storageKey - The S3 object key
 * @returns Image metadata (width, height, format)
 */
export const getImageMetadata = async (
  storageKey: string
): Promise<SharpMetadata> => {
  // First verify the object exists
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: TMP_BUCKET,
        Key: storageKey,
      })
    );
  } catch {
    throw new Error(`Image not found in storage: ${storageKey}`);
  }

  // Get the image data
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: TMP_BUCKET,
      Key: storageKey,
    })
  );

  if (!response.Body) {
    throw new Error('Failed to read image from storage');
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

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
