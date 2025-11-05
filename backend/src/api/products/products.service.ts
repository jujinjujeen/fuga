import { Prisma } from '@prisma/client';
import { imageService } from '@f/be/services/image.service';
import {
  createProduct as createProductDb,
  getAllProducts as getAllProductsDb,
  getProductById as getProductByIdDb,
  updateProduct as updateProductDb,
  deleteProduct as deleteProductDb,
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

/**
 * Updates an existing product
 * Optionally updates the image if new imageKey is provided
 *
 * @param id - Product UUID
 * @param title - Updated title
 * @param artist - Updated artist
 * @param imageKey - Optional new image key
 * @returns Updated product DTO or null if not found
 */
export const updateProduct = async (
  id: string,
  title: string,
  artist: string,
  imageKey?: string
) => {
  let oldImageKey: string | null = null;

  try {
    // Build update data
    const updateData: Prisma.ProductUpdateInput = {
      title,
      artist,
    };

    // If new image provided, process it and track old image for cleanup
    if (imageKey) {
      // Get current product to retrieve old image key
      const currentProduct = await getProductByIdDb(id);
      if (currentProduct?.image) {
        oldImageKey = currentProduct.image.storageKey;
      }

      if (imageKey !== oldImageKey) {
        const imageMetadata = await imageService.getImageMetadata(imageKey);
        await moveObjectToPermanent(imageKey);

        updateData.image = {
          update: {
            storageKey: imageKey,
            width: imageMetadata.width,
            height: imageMetadata.height,
            format: imageMetadata.format,
          },
        };
      }
    }

    const product = await updateProductDb(id, updateData);

    if (!product) {
      return null;
    }

    // Remove old image from storage after successful update
    if (imageKey && oldImageKey && imageKey !== oldImageKey) {
      removeObject(oldImageKey, 'perm').catch((err) => {
        console.error(`Failed to remove old image ${oldImageKey}:`, err);
      });
    }

    // Invalidate products cache
    deleteCache(getKeyHelper('/products'));
    deleteCache(getKeyHelper(`/products/${id}`));

    return mapProduct(product);
  } catch (error) {
    if (error instanceof Error) {
      // Cleanup: remove the uploaded image if update fails due to image issues
      if (
        imageKey &&
        (error.message.includes('Unsupported image format') ||
          error.message.includes('Invalid image metadata'))
      ) {
        removeObject(imageKey);
      }
    }
    throw error;
  }
};

/**
 * Deletes a product and its associated image from storage
 *
 * @param id - Product UUID
 * @returns true if deleted, false if not found
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  // Delete the product (cascade will delete the image record)
  const deletedProduct = await deleteProductDb(id);

  if (!deletedProduct) {
    return false;
  }

  // Remove image from storage if it exists
  if (deletedProduct.image) {
    removeObject(deletedProduct.image.storageKey, 'perm').catch((err) => {
      console.error(
        `Failed to remove image ${deletedProduct.image?.storageKey}:`,
        err
      );
    });
  }

  // Invalidate products cache
  deleteCache(getKeyHelper('/products'));
  deleteCache(getKeyHelper(`/products/${id}`));

  return true;
};
