import { imageService } from '@f/be/services/image.service';
import {
  createProduct as createProductDb,
  getAllProducts as getAllProductsDb,
  getProductById as getProductByIdDb,
} from './products.repo';
import { deleteCache, getKeyHelper } from '@f/be/lib/redisClient';
import {
  moveObjectToPermanent,
  removeObject,
} from '@f/be/services/storage.service';
import { mapProducts, mapProduct } from '@f/be/mappers/products.mapper';

/**
 * Creates a new product with associated image,
 * promotes image to permanent storage, and handles cleanup on failure.
 *
 * @param title string
 * @param artist string
 * @param imageKey string
 * @returns
 */
export const createProduct = async (
  title: string,
  artist: string,
  imageKey: string
) => {
  try {
    // Get image metadata from uploaded file
    const imageMetadata = await imageService.getImageMetadata(imageKey);

    // Promote image to permanent storage
    await moveObjectToPermanent(imageKey);

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

    // Invalidate products cache
    deleteCache(getKeyHelper('/products'));

    return mapProduct(product);
  } catch (error) {
    if (error instanceof Error) {
      // Cleanup: remove the uploaded image if product creation fails due to image issues
      if (
        error.message.includes('Unsupported image format') ||
        error.message.includes('Invalid image metadata')
      ) {
        removeObject(imageKey);
      }
    }
    throw error;
  }
};

/**
 * Gets all products with their images mapped to DTOs
 *
 * @returns
 */
export const getAllProducts = async () => {
  const products = await getAllProductsDb();

  return mapProducts(products);
};

/**
 * Gets a single product by ID with image mapped to DTO
 *
 * @param id - Product UUID
 * @returns Product DTO or null if not found
 */
export const getProductById = async (id: string) => {
  const product = await getProductByIdDb(id);

  if (!product) {
    return null;
  }

  return mapProduct(product);
};
