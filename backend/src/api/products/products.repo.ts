import { Product } from '@prisma/client';
import prisma from '@f/prismaInstance';

export const getAllProducts = async (): Promise<Product[]> => {
    return prisma.product.findMany();
}