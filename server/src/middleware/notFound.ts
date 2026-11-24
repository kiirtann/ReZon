import type { NextFunction, Request, Response } from 'express';
import { notFoundError } from '../lib/errors.js';

/**
 * Catch-all middleware for unmatched routes.
 * Forwards a 404 AppError to errorHandler so all 404s share the standard envelope.
 */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(notFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}
