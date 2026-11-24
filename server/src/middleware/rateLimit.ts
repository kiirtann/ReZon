import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  skipInTest?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const PRUNE_THRESHOLD = 1000;

/**
 * Creates a zero-dependency in-memory fixed-window rate limiter middleware keyed by client IP.
 * Useful for protecting sensitive endpoints (e.g. login/register) against brute-force attempts.
 */
export function createRateLimiter({ windowMs, max, skipInTest = false }: RateLimitOptions) {
  const store = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (skipInTest && env.NODE_ENV === 'test') {
      next();
      return;
    }

    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const existing = store.get(key);

    if (!existing || now >= existing.resetAt) {
      // Lazily prune expired entries if the map grows large, avoiding background timers.
      if (store.size >= PRUNE_THRESHOLD) {
        for (const [entryKey, entry] of store.entries()) {
          if (now >= entry.resetAt) {
            store.delete(entryKey);
          }
        }
      }

      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    existing.count += 1;

    if (existing.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests, please try again later.',
        },
      });
      return;
    }

    next();
  };
}
