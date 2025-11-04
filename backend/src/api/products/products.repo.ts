import { Prisma } from '@prisma/client';
import prisma from '@f/prismaInstance';
import { ProductWithImage } from '@f/be/types/shared';

export const getAllProducts = async (): Promise<ProductWithImage[]> => {
  return prisma.product.findMany({
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
