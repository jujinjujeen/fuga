import { Prisma } from '@prisma/client';
import prisma from '@f/prismaInstance';
import { ProductWithImage } from '@f/be/types/shared';

export const getAllProducts = async (
  search?: string
): Promise<ProductWithImage[]> => {
  const where: Prisma.ProductWhereInput = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { artist: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  return prisma.product.findMany({
    where,
    include: {
      image: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Gets a single product by ID
 * @param id - Product UUID
 * @returns Product with image relation or null if not found
 */
export const getProductById = async (
  id: string
): Promise<ProductWithImage | null> => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      image: true,
    },
  });
};

/**
 * Creates a new product with associated image
 * @param data - Product creation data including image info
 * @returns Created product with image relation
 */
export const createProduct = async (
  data: Prisma.ProductCreateInput
): Promise<ProductWithImage> => {
  return prisma.product.create({
    data,
    include: {
      image: true,
    },
  });
};

/**
 * Updates an existing product
 * @param id - Product UUID
 * @param data - Product update data
 * @returns Updated product with image relation or null if not found
 */
export const updateProduct = async (
  id: string,
  data: Prisma.ProductUpdateInput
): Promise<ProductWithImage | null> => {
  try {
    return await prisma.product.update({
      where: { id },
      data,
      include: {
        image: true,
      },
    });
  } catch (error) {
    // Prisma throws P2025 when record to update doesn't exist
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return null;
      }
    }
    throw error;
  }
};

/**
 * Deletes a product and its associated image
 * @param id - Product UUID
 * @returns Deleted product with image relation or null if not found
 */
export const deleteProduct = async (
  id: string
): Promise<ProductWithImage | null> => {
  try {
    return await prisma.product.delete({
      where: { id },
      include: {
        image: true,
      },
    });
  } catch (error) {
    // Prisma throws P2025 when record to delete doesn't exist
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return null;
      }
    }
    throw error;
  }
};
