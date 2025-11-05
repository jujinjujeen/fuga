import { Request, Response } from 'express';
import { deleteProduct } from './products.service';
import { HTTP_STATUS, HTTP_LABEL } from '@f/be/constants';

/**
 * DELETE /products/:productId - Delete a product
 */
export const deleteProductController = async (
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

    const deleted = await deleteProduct(productId);

    if (!deleted) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        title: HTTP_LABEL.NOT_FOUND,
        message: `Product with ID ${productId} not found`,
        code: HTTP_STATUS.NOT_FOUND,
      });
      return;
    }

    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    console.error('Delete product error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to delete product';
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      title: 'Failed to Delete Product',
      message,
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};
