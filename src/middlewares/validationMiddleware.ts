import { NextFunction, Request, Response } from 'express';
import { z, ZodType } from 'zod';  // Correct import for Zod types
import { AppError } from '../error/AppError';

// Updated validate function with correct type for schema (ZodType)
export const validate =
  (schema: ZodType<any, any>, source: 'body' | 'query' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    // Safe parsing the data from the requested source (body or query)
    const parsed = schema.safeParse(req[source]);

    // If parsing fails, send the error as an AppError
    if (!parsed.success) {
      const msg = parsed.error.issues
        .map(i => `${i.path.join('.')}: ${i.message}`)
        .join('; ');

      return next(new AppError(msg, 400)); // 400 Bad Request
    }

    // Put validated payload into res.locals
    res.locals.validated = parsed.data;
    next();
  };
