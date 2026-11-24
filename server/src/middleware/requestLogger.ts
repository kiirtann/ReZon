import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

/**
 * Concise HTTP request logger for development and production.
 * Skipped in test mode to keep test output clean.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (env.NODE_ENV === 'test') {
    next();
    return;
  }

  const startMs = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startMs;
    console.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
  });

  next();
}
