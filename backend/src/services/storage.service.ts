import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { randomUUID } from 'crypto';
import path from 'path';
import { MAX_FILE_SIZE_BYTES, TIME_S } from '../constants';

const TMP_BUCKET = process.env.S3_TMP_BUCKET || 'tmp';
// const PERM_BUCKET = process.env.S3_PERM_BUCKET || 'perm';

// Internal S3 client for backend operations (reading/writing objects)
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
  const sanitizedName = path
    .basename(fileName, ext)
    .replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${uuid}/${sanitizedName}${ext}`;
};

/**
 * Generates a presigned POST for uploading to temporary bucket
 *
 * @param fileName - Original filename
 * @param fileType - MIME type
 * @param fileSize - Size in bytes
 * @returns Object containing presigned POST data (url, fields) and storage key
 * @throws Error if validation fails
 */
export const generatePresignedUploadUrl = async (
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<{
  url: string;
  fields: Record<string, string>;
  storageKey: string;
}> => {
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

  // Create presigned POST with security conditions
  const { url, fields } = await createPresignedPost(s3PublicClient, {
    Bucket: TMP_BUCKET,
    Key: storageKey,
    Conditions: [
      ['content-length-range', 0, MAX_FILE_SIZE_BYTES], // 10MB max
      ['eq', '$Content-Type', fileType], // Enforce exact content type
    ],
    Fields: {
      'Content-Type': fileType,
    },
    Expires: TIME_S.FIVE_MINUTES,
  });

  return { url, fields, storageKey };
};

/**
 * Checks if an object exists in the temporary bucket
 * @param storageKey - The S3 object key
 * @returns true if object exists, false otherwise
 * @throws Error if unable to check existence
 */
export const objectExists = async (storageKey: string): Promise<boolean> => {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: TMP_BUCKET,
        Key: storageKey,
      })
    );
    return true;
  } catch (error: unknown) {
    // AWS SDK throws error with name 'NotFound' when object doesn't exist
    if (error && typeof error === 'object' && 'name' in error) {
      if (error.name === 'NotFound') {
        return false;
      }
    }
    // Re-throw other errors
    throw new Error(`Failed to check object existence: ${storageKey}`);
  }
};

/**
 * Retrieves an object from the temporary bucket as a Buffer
 * @param storageKey - The S3 object key
 * @returns Buffer containing the object data
 * @throws Error if object not found or failed to retrieve
 */
export const getObject = async (storageKey: string): Promise<Buffer> => {
  // Verify object exists first
  const exists = await objectExists(storageKey);
  if (!exists) {
    throw new Error(`Object not found in storage: ${storageKey}`);
  }

  // Get the object data
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: TMP_BUCKET,
      Key: storageKey,
    })
  );

  if (!response.Body) {
    throw new Error(`Failed to read object from storage: ${storageKey}`);
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

/**
 * Service interface for storage operations
 */
export const storageService = {
  generatePresignedUploadUrl,
  objectExists,
  getObject,
};
