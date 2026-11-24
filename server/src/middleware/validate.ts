import type { NextFunction, Request, Response } from 'express';
import { type ZodTypeAny } from 'zod';
import { validationError } from '../lib/errors.js';

export interface ValidatedRequestData {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

// Express 5 defines req.query as a read-only getter, so we store parsed & typed
// values on req.validated instead of mutating req.query directly.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      validated?: ValidatedRequestData;
    }
  }
}

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validates request body, query, and/or params against Zod schemas at the route boundary.
 * On success, stores parsed values on `req.validated`.
 * On failure, forwards a 400 VALIDATION_ERROR AppError to `errorHandler`.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const validated: ValidatedRequestData = {};

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        next(validationError('Validation failed', result.error.flatten().fieldErrors));
        return;
      }
      validated.params = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        next(validationError('Validation failed', result.error.flatten().fieldErrors));
        return;
      }
      validated.query = result.data;
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        next(validationError('Validation failed', result.error.flatten().fieldErrors));
        return;
      }
      validated.body = result.data;
    }

    req.validated = validated;
    next();
  };
}
