// FILE: src/middlewares/errorHandler.ts
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../error/AppError';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal Server Error';

  if (status >= 500) {
    console.error('[ErrorMiddleware]', {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      response: err?.response,
      stack: err?.stack,
    });
  }

  res.status(status).json({ success: false, message });
};
