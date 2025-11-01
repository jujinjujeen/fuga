import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import path from 'path';
import { TIME_S } from '../constants';

const TMP_BUCKET = process.env.S3_TMP_BUCKET || 'tmp';
// const PERM_BUCKET = process.env.S3_PERM_BUCKET || 'perm';

// Internal S3 client for backend operations
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

// Public S3 client for generating presigned URLs accessible from browser
const s3PublicClient = new S3Client({
  endpoint: process.env.S3_PUBLIC_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

/**
 * Validates file type for image uploads
 * @param fileType - MIME type of the file
 * @returns true if valid image type
 */
const isValidImageType = (fileType: string): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return allowedTypes.includes(fileType.toLowerCase());
};

/**
 * Validates file size
 * @param fileSize - Size of file in bytes
 * @returns true if within allowed limit
 */
const isValidFileSize = (fileSize: number): boolean => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  return fileSize > 0 && fileSize <= MAX_FILE_SIZE;
};

/**
 * Generates a unique storage key for the file
 * @param fileName - Original filename
 * @returns Storage key in format: uuid/filename
 */
const generateStorageKey = (fileName: string): string => {
  const uuid = randomUUID();
  const ext = path.extname(fileName);
  const sanitizedName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${uuid}/${sanitizedName}${ext}`;
};

/**
 * Generates a presigned URL for uploading to temporary bucket
 *
 * @param fileName - Original filename
 * @param fileType - MIME type
 * @param fileSize - Size in bytes
 * @returns Object containing presigned URL and storage key
 * @throws Error if validation fails
 */
export const generatePresignedUploadUrl = async (
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<{ url: string; storageKey: string }> => {
  // Validate inputs
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('Invalid filename');
  }

  if (!isValidImageType(fileType)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed');
  }

  if (!isValidFileSize(fileSize)) {
    throw new Error('Invalid file size. Maximum 10MB allowed');
  }

  // Generate unique storage key
  const storageKey = generateStorageKey(fileName);

  // Create S3 command with security headers
  const command = new PutObjectCommand({
    Bucket: TMP_BUCKET,
    Key: storageKey,
    ContentType: fileType,
    ContentLength: fileSize,
  });

  // Generate presigned URL using public client so signature matches public endpoint
  const url = await getSignedUrl(s3PublicClient, command, {
    expiresIn: TIME_S.FIFTEEN_MINUTES,
  });

  return { url, storageKey };
};

/**
 * Service interface for storage operations
 */
export const storageService = {
  generatePresignedUploadUrl,
};
