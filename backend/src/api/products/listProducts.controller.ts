import { Request, Response } from 'express';
import { getAllProducts } from './products.service';

/**
 * GET /products - List all products
 * Supports optional search query via 'q' parameter
 */
export const listProducts = async (req: Request, res: Response) => {
  try {
    const search = req.query.q as string | undefined;
    const products = await getAllProducts(search);

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
