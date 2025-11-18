import { Request, Response } from 'express';
import { getAllProducts } from './products.service';
import { HTTP_STATUS } from '@f/be/constants';

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
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      title: 'Failed to Fetch Products',
      message,
    });
  }
};
