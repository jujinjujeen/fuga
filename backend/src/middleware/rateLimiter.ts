import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { TIME_MS } from '../constants';

/**
 * Rate limiter middleware to limit the number of requests from a single IP.
 * This helps prevent abuse and ensures fair usage of the API.
 * 
 * @see https://www.npmjs.com/package/express-rate-limit
 * 
 * limit each IP to 100 requests per 15 minutes
 * 
 */
const apiLimiter = rateLimit({
  windowMs: TIME_MS.FIFTEEN_MINUTES,
  max: 100, // max requests
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    error: 'Too many requests, slow your roll.',
  },
});

export default function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return apiLimiter(req, res, next);
}
