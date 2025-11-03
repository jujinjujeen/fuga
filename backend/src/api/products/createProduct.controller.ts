import { Request, Response } from 'express';
import { CreateProductInput } from './products.validation';
import { createProduct } from './products.service';

/**
 * POST /products - Create a new product
 */
export const createProductController = async (
  req: Request<object, object, CreateProductInput>,
  res: Response
) => {
  try {
    const { title, artist, imageKey } = req.body;

    const product = await createProduct(title, artist, imageKey);

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to create product';
    res.status(400).json({
      title: 'Product Creation Failed',
      message,
    });
  }
};
