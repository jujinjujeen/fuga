import type { Request, Response, NextFunction } from 'express';

/**
 * A middleware function to handle errors in Express applications.
 * It logs the error and sends a generic response to the client.
 *
 * @param err - The error object.
 * @param _req - The request object (not used).
 * @param res - The response object.
 * @param _next - The next middleware function (not used).
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
};
