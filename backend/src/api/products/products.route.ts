import { Router } from 'express';
import { productsController } from './products.controller';

const router = Router();

router.get('/products', productsController);

export default router;
