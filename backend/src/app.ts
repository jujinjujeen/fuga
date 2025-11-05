import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

import { router } from './api';
import { errorHandler } from './middleware/errorHandler';
import { TIME_S } from './constants';
import { cacheMiddleware } from './middleware/cache';
import rateLimiter from './middleware/rateLimiter';
import { compressionMiddleware } from './middleware/compressionMiddleware';

export const createApp = () => {
  const app = express();
  const swaggerDocument = YAML.load(
    path.resolve(__dirname, '../docs/openapi.yaml')
  );

  // Security headers
  app.use(helmet());

  // Logging
  app.use(morgan('combined'));

  // CORS
  // Cors origin is set in production via environment variable
  // or defaults to docker run fe service in development
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5445',
      exposedHeaders: ['ETag'], // Expose ETag header for optimistic concurrency control
    })
  );

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  app.use(rateLimiter);

  // Compression
  app.use(compressionMiddleware);

  // Routes
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/api', cacheMiddleware(TIME_S.ONE_HOUR));
  app.use('/api', router);

  // 404 fallback
  app.use((_req, res) => {
    res.status(404).json({ message: 'Not Found' });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};
