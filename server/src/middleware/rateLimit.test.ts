import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRateLimiter } from './rateLimit.js';

function createTestApp(options: Parameters<typeof createRateLimiter>[0]) {
  const app = express();
  app.use('/limited', createRateLimiter(options), (_req, res) => {
    res.status(200).json({ ok: true });
  });
  return app;
}

describe('createRateLimiter', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows up to max requests and blocks max + 1 with 429 RATE_LIMITED and Retry-After', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const app = createTestApp({ windowMs: 60_000, max: 3, skipInTest: false });

    for (let i = 0; i < 3; i += 1) {
      const res = await request(app).get('/limited');
      expect(res.status).toBe(200);
    }

    const blocked = await request(app).get('/limited');
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later.',
      },
    });
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThanOrEqual(1);
    expect(Number(blocked.headers['retry-after'])).toBeLessThanOrEqual(60);
  });

  it('resets the request count after windowMs elapses', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const app = createTestApp({ windowMs: 10_000, max: 2, skipInTest: false });

    expect((await request(app).get('/limited')).status).toBe(200);
    expect((await request(app).get('/limited')).status).toBe(200);
    expect((await request(app).get('/limited')).status).toBe(429);

    vi.advanceTimersByTime(10_000);

    const afterReset = await request(app).get('/limited');
    expect(afterReset.status).toBe(200);
  });

  it('skips rate limiting in test mode when skipInTest is true', async () => {
    const app = createTestApp({ windowMs: 60_000, max: 1, skipInTest: true });

    expect((await request(app).get('/limited')).status).toBe(200);
    expect((await request(app).get('/limited')).status).toBe(200);
    expect((await request(app).get('/limited')).status).toBe(200);
  });
});
