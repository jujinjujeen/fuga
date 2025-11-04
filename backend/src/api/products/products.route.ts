import { Router } from 'express';
import { createProductController } from './createProduct.controller';
import { listProducts } from './listProducts.controller';
import { getProduct } from './getProduct.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { createProductSchema } from './products.validation';

const router = Router();

/**
 * GET /api/products
 * List all products
 */
router.get('/products', listProducts);

/**
 * GET /api/products/:productId
 * Get a single product by ID
 */
router.get('/products/:productId', getProduct);

/**
 * POST /api/products
 * Create a new product
 */
router.post(
  '/products',
  validateRequest(createProductSchema, 'body'),
  createProductController
);

export default router;
