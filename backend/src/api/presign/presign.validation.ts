import { z } from 'zod';

/**
 * Validation schema for presign request
 */
export const presignRequestSchema = z.object({
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name too long')
    .regex(/^[^/\\<>:"|?*]+$/, 'Invalid file name'),
  fileType: z
    .string()
    .regex(/^image\/(jpeg|png|webp)$/, 'Invalid file type. Only JPEG, PNG, and WEBP allowed'),
  fileSize: z
    .number()
    .int('File size must be an integer')
    .positive('File size must be positive')
    .max(10 * 1024 * 1024, 'File size exceeds 10MB limit'),
});

export type PresignRequest = z.infer<typeof presignRequestSchema>;
