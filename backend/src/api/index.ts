import { Router } from 'express';
import healthRouter from './health/health.route';
import productRouter from './products/products.route';

export const router = Router();

router.use(healthRouter);
router.use(productRouter)