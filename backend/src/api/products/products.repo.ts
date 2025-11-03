import { Product, Image, Prisma } from '@prisma/client';
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
 * Creates a new product with associated image
 * @param data - Product creation data including image info
 * @returns Created product with image relation
 */
export const createProduct = async (
  data: Prisma.ProductCreateInput
): Promise<Product> => {
  return prisma.product.create({
    data,
    include: {
      image: true,
    },
  });
};
