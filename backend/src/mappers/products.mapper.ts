import { Product } from '@f/types/api-schemas';
import { ProductWithImage } from '../types/shared';

export const mapProduct = (product: ProductWithImage): Product => {
  return {
    id: product.id,
    title: product.title,
    artist: product.artist,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    image: {
      url: `http://localhost:9000/perm/${product.image?.storageKey}`,
      width: product.image?.width || 0,
      height: product.image?.height || 0,
      format: product.image?.format || 'jpeg',
    },
  };
};

export const mapProducts = (products: ProductWithImage[]) => {
  return products.map(mapProduct);
};
