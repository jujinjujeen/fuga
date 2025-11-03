import { z } from 'zod';

/**
 * Validation schema for creating a new product
 * Matches ProductCreate schema from OpenAPI spec
 */
export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  artist: z.string().min(1, 'Artist is required').max(200, 'Artist is too long'),
  imageKey: z.string().min(1, 'Image key is required'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
