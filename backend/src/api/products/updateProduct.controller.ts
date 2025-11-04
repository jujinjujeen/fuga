import { Request, Response } from 'express';
import { UpdateProductInput } from './products.validation';
import { updateProduct, getProductById } from './products.service';
import { HTTP_STATUS, HTTP_LABEL } from '@f/be/constants';
import { generateETag, validateIfMatch } from '@f/be/utils/etag';

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

    // Get current product to validate ETag
    const currentProduct = await getProductById(productId);

    if (!currentProduct) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        title: HTTP_LABEL.NOT_FOUND,
        message: `Product with ID ${productId} not found`,
        code: HTTP_STATUS.NOT_FOUND,
      });
      return;
    }

    // Validate If-Match header for optimistic concurrency control
    const ifMatchHeader = req.headers['if-match'];
    const currentETag = generateETag(new Date(currentProduct.updatedAt));

    if (!validateIfMatch(ifMatchHeader, currentETag)) {
      res.status(HTTP_STATUS.CONFLICT).json({
        title: HTTP_LABEL.CONFLICT,
        message: 'Resource has been modified by another request',
        code: HTTP_STATUS.CONFLICT,
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

    // Generate new ETag from updated timestamp
    const newETag = generateETag(new Date(updatedProduct.updatedAt));

    res.setHeader('ETag', newETag);
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
