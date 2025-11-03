import { S3Client } from '@aws-sdk/client-s3';

export const TMP_BUCKET = process.env.S3_TMP_BUCKET || 'tmp';
export const PERM_BUCKET = process.env.S3_PERM_BUCKET || 'perm';

// Internal S3 client for backend operations (reading/writing objects)
export const s3ClientInt = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

// Public S3 client for generating presigned URLs accessible from browser
export const s3PublicClient = new S3Client({
  endpoint: process.env.S3_PUBLIC_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});
