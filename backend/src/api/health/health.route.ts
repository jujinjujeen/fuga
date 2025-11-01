import { Router } from 'express';
import { healthController } from './health.controller';

const router = Router();

/**
 * See: http://localhost:5444/docs/#/Health/get_health
 */
router.get('/healthz', healthController);

export default router;
