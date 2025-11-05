import { Request, Response } from 'express';
import { getProductById } from './products.service';
import { HTTP_STATUS, HTTP_LABEL } from '@f/be/constants';

/**
 * GET /products/:productId - Get a single product by ID
 */
export const getProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;

    if (!productId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        title: HTTP_LABEL.BAD_REQUEST,
        message: 'Product ID is required',
        code: HTTP_STATUS.BAD_REQUEST,
      });
      return;
    }

    const product = await getProductById(productId);

    if (!product) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        title: HTTP_LABEL.NOT_FOUND,
        message: `Product with ID ${productId} not found`,
        code: HTTP_STATUS.NOT_FOUND,
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json(product);
  } catch (error) {
    console.error('Get product error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to fetch product';
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      title: 'Failed to Fetch Product',
      message,
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};
