import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { HTTP_LABEL, HTTP_STATUS } from '../constants';
import { ErrorResponse } from '@f/types/api-schemas';

type ValidationSource = 'body' | 'params' | 'query';

/**
 * Returns an Express middleware that checks `req[source]` against the given Zod schema.
 * If validation fails, sends a 400 with the Zod error message appended.
 * @param schema - The Zod schema to validate against.
 * @param source - The source of the request data to validate (body, params, or query).
 * @returns An Express middleware function.
 */
export function validateRequest(
  schema: AnyZodObject,
  source: ValidationSource
) {
  return (req: Request, res: Response<ErrorResponse>, next: NextFunction) => {
    const parseResult = schema.safeParse(req[source]);
    if (!parseResult.success) {
      const zodError = parseResult.error as ZodError;
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        title: HTTP_LABEL.BAD_REQUEST,
        message:
          'Request validation failed: ' +
          zodError.errors.map((e) => e.message).join(', '),
        code: HTTP_STATUS.BAD_REQUEST,
      });
      return;
    }

    req[source] = parseResult.data;
    return next();
  };
}
