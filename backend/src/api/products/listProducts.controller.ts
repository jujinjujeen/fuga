import { Request, Response } from 'express';
import { getAllProducts } from './products.repo';

/**
 * GET /products - List all products
 */
export const listProducts = async (_req: Request, res: Response) => {
  try {
    const products = await getAllProducts();
    res.status(200).json({ products });
  } catch (error) {
    console.error('List products error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to fetch products';
    res.status(500).json({
      title: 'Failed to Fetch Products',
      message,
    });
  }
};
