import { Request, Response } from 'express';
import { UpdateProductInput } from './products.validation';
import { updateProduct } from './products.service';
import { HTTP_STATUS, HTTP_LABEL } from '@f/be/constants';

/**
 * POST /products/:productId - Update an existing product
 */
export const updateProductController = async (
  req: Request<{ productId: string }, object, UpdateProductInput>,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { title, artist, imageKey } = req.body;

    if (!productId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        title: HTTP_LABEL.BAD_REQUEST,
        message: 'Product ID is required',
        code: HTTP_STATUS.BAD_REQUEST,
      });
      return;
    }

    // Update the product
    const updatedProduct = await updateProduct(
      productId,
      title,
      artist,
      imageKey
    );

    if (!updatedProduct) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        title: HTTP_LABEL.NOT_FOUND,
        message: `Product with ID ${productId} not found`,
        code: HTTP_STATUS.NOT_FOUND,
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to update product';
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      title: 'Failed to Update Product',
      message,
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};
