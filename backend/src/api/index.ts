import { Router } from 'express';
import healthRouter from './health/health.route';
import productRouter from './products/products.route';
import presignRouter from './presign/presign.route';

export const router = Router();

router.use(healthRouter);
router.use(productRouter);
router.use(presignRouter);