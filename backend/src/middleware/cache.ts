import { Request, Response, NextFunction } from 'express';
import redis from '@f/redisClient';

/**
 * Middleware to cache GET responses in Redis.
 * @param ttlSeconds Time to live in seconds for the cache
 * @returns
 */
export function cacheMiddleware(ttlSeconds: number) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Only cache GETs exclude health checks and queries
    if (
      req.method !== 'GET' ||
      req.originalUrl.includes('health') ||
      req.originalUrl.includes('?')
    ) {
      next();
      return;
    }

    const cacheKey = `cache:${req.originalUrl}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      // short-circuit if we have it
      console.log(`Cache hit for ${cacheKey}`);
      res.json(JSON.parse(cached));
      return;
    }

    // hijack send to capture payload
    const originalSend = res.send.bind(res);
    res.send = (body: unknown) => {
      // only cache 200s
      if (res.statusCode === 200) {
        // body might be Buffer or string
        const payload = typeof body === 'string' ? body : JSON.stringify(body);
        redis.setex(cacheKey, ttlSeconds, payload).catch((err) => {
          console.error(`Failed to cache ${req.originalUrl}:`, err);
        });
      }
      return originalSend(body);
    };

    next();
  };
}
