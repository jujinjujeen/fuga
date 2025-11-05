import type { Product } from '@f/types/api-schemas';
import { ProductWithImage } from '../types/shared';
import { PERM_BUCKET } from '../lib/s3';

export const mapProduct = (product: ProductWithImage): Product => {
  return {
    id: product.id,
    title: product.title,
    artist: product.artist,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    image: {
      url: `${process.env.S3_PUBLIC_ENDPOINT}/${PERM_BUCKET}/${product.image?.storageKey}`,
      key: product.image?.storageKey || '',
      width: product.image?.width || 0,
      height: product.image?.height || 0,
      format: product.image?.format || 'jpeg',
    },
  };
};

export const mapProducts = (products: ProductWithImage[]): Product[] => {
  return products.map(mapProduct);
};
