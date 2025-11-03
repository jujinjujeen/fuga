import type { Product, Image } from '@prisma/client';

export type ProductWithImage = Product & {
  image: Image | null;
};