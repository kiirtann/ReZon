import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createApp } from '../app.js';
import {
  conflictError,
  forbiddenError,
  notFoundError,
  unauthorizedError,
  validationError,
} from '../lib/errors.js';
import { errorHandler } from './errorHandler.js';
import { notFound } from './notFound.js';
import { validate } from './validate.js';

describe('app plumbing & error handling', () => {
  it('returns 404 NOT_FOUND for unmatched routes', async () => {
    const res = await request(createApp()).get('/api/v1/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Route GET /api/v1/does-not-exist not found',
      },
    });
  });

  it('formats AppError factories into the standard error envelope', async () => {
    const app = express();
    app.get('/validation', () => {
      throw validationError('Bad input', { field: ['Required'] });
    });
    app.get('/unauthorized', () => {
      throw unauthorizedError();
    });
    app.get('/forbidden', () => {
      throw forbiddenError();
    });
    app.get('/not-found', () => {
      throw notFoundError('Missing item');
    });
    app.get('/conflict', () => {
      throw conflictError('Already exists');
    });
    app.use(notFound);
    app.use(errorHandler);

    const v = await request(app).get('/validation');
    expect(v.status).toBe(400);
    expect(v.body).toEqual({
      error: { code: 'VALIDATION_ERROR', message: 'Bad input', details: { field: ['Required'] } },
    });

    const u = await request(app).get('/unauthorized');
    expect(u.status).toBe(401);
    expect(u.body.error.code).toBe('UNAUTHENTICATED');

    const f = await request(app).get('/forbidden');
    expect(f.status).toBe(403);
    expect(f.body.error.code).toBe('FORBIDDEN');

    const n = await request(app).get('/not-found');
    expect(n.status).toBe(404);
    expect(n.body.error.code).toBe('NOT_FOUND');

    const c = await request(app).get('/conflict');
    expect(c.status).toBe(409);
    expect(c.body.error.code).toBe('CONFLICT');
  });

  it('hides stack traces and internal messages on unexpected errors', async () => {
    const app = express();
    app.get('/boom', () => {
      throw new Error('secret database connection string');
    });
    app.use(errorHandler);

    const res = await request(app).get('/boom');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });

  it('stores validated body/query/params on req.validated without mutating Express 5 req.query', async () => {
    const app = express();
    app.use(express.json());
    app.post(
      '/items/:id',
      validate({
        params: z.object({ id: z.string().min(2) }),
        query: z.object({ page: z.coerce.number().int().min(1).default(1) }),
        body: z.object({ name: z.string().trim().min(1) }),
      }),
      (req, res) => {
        res.json({ data: req.validated });
      },
    );
    app.use(errorHandler);

    const ok = await request(app).post('/items/abc?page=3').send({ name: '  Widget  ' });
    expect(ok.status).toBe(200);
    expect(ok.body).toEqual({
      data: {
        params: { id: 'abc' },
        query: { page: 3 },
        body: { name: 'Widget' },
      },
    });

    const bad = await request(app).post('/items/abc?page=0').send({ name: '' });
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe('VALIDATION_ERROR');
  });
});
