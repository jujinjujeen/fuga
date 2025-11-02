import { Router } from 'express';
import { createProductController } from './createProduct.controller';
import { listProducts } from './listProducts.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { createProductSchema } from './products.validation';

const router = Router();

/**
 * GET /api/products
 * List all products
 */
router.get('/products', listProducts);

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
