import { imageService } from '@f/be/services/image.service';
import { createProduct as createProductDb } from './products.repo';
import { deleteCache, getKeyHelper } from '@f/be/lib/redisClient';

export const createProduct = async (
  title: string,
  artist: string,
  imageKey: string
) => {
  // Get image metadata from uploaded file
  const imageMetadata = await imageService.getImageMetadata(imageKey);

  // Create product with image
  const product = await createProductDb({
    title,
    artist,
    image: {
      create: {
        storageKey: imageKey,
        width: imageMetadata.width,
        height: imageMetadata.height,
        format: imageMetadata.format,
      },
    },
  });

  deleteCache(getKeyHelper('/products'));

  return product;
};
