import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { resetDb } from '../../test/db.js';

function getCookieHeader(res: request.Response): string[] {
  const header = res.headers['set-cookie'];
  if (!header) return [];
  return Array.isArray(header) ? header : [header];
}

describe('Auth API (/api/v1/auth)', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers a user, normalizes email, omits passwordHash, and sets httpOnly token cookie', async () => {
      const res = await request(createApp()).post('/api/v1/auth/register').send({
        name: 'Alice',
        email: 'Alice@Example.com',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        data: {
          id: expect.any(String),
          name: 'Alice',
          email: 'alice@example.com',
        },
      });
      expect(res.body.data).not.toHaveProperty('passwordHash');

      const cookies = getCookieHeader(res);
      const tokenCookie = cookies.find((c) => c.startsWith('token='));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toContain('HttpOnly');
      expect(tokenCookie).toContain('SameSite=Lax');
    });

    it('returns 409 CONFLICT on duplicate email (case-insensitive)', async () => {
      const app = createApp();
      await request(app).post('/api/v1/auth/register').send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      });

      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Alice Two',
        email: 'ALICE@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('returns 400 VALIDATION_ERROR when password is shorter than 8 characters', async () => {
      const res = await request(createApp()).post('/api/v1/auth/register').send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'short',
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(createApp()).post('/api/v1/auth/register').send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      });
    });

    it('logs in with valid credentials and sets token cookie', async () => {
      const res = await request(createApp()).post('/api/v1/auth/login').send({
        email: 'ALICE@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        data: {
          id: expect.any(String),
          name: 'Alice',
          email: 'alice@example.com',
        },
      });
      expect(res.body.data).not.toHaveProperty('passwordHash');

      const cookies = getCookieHeader(res);
      expect(cookies.some((c) => c.startsWith('token='))).toBe(true);
    });

    it('returns 401 UNAUTHENTICATED with generic message on wrong password', async () => {
      const res = await request(createApp()).post('/api/v1/auth/login').send({
        email: 'alice@example.com',
        password: 'wrong-password',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toEqual({
        code: 'UNAUTHENTICATED',
        message: 'Invalid email or password',
      });
    });

    it('returns 401 UNAUTHENTICATED with identical message on wrong email', async () => {
      const res = await request(createApp()).post('/api/v1/auth/login').send({
        email: 'nobody@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toEqual({
        code: 'UNAUTHENTICATED',
        message: 'Invalid email or password',
      });
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns 200 { data: User } when authenticated with cookie', async () => {
      const app = createApp();
      const agent = request.agent(app);

      await agent.post('/api/v1/auth/register').send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      });

      const res = await agent.get('/api/v1/auth/me');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        data: {
          id: expect.any(String),
          name: 'Alice',
          email: 'alice@example.com',
        },
      });
      expect(res.body.data).not.toHaveProperty('passwordHash');
    });

    it('returns 401 UNAUTHENTICATED without cookie', async () => {
      const res = await request(createApp()).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('returns 401 UNAUTHENTICATED with invalid cookie', async () => {
      const res = await request(createApp())
        .get('/api/v1/auth/me')
        .set('Cookie', ['token=not-a-valid-jwt']);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('returns 204 and clears the token cookie', async () => {
      const app = createApp();
      const agent = request.agent(app);

      await agent.post('/api/v1/auth/register').send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      });

      const logoutRes = await agent.post('/api/v1/auth/logout');
      expect(logoutRes.status).toBe(204);

      const cookies = getCookieHeader(logoutRes);
      const clearedCookie = cookies.find((c) => c.startsWith('token='));
      expect(clearedCookie).toBeDefined();
      expect(clearedCookie).toMatch(/token=;/);

      const meRes = await agent.get('/api/v1/auth/me');
      expect(meRes.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/auth/me', () => {
    it('updates name and email for the signed-in user', async () => {
      const app = createApp();
      const agent = request.agent(app);

      await agent.post('/api/v1/auth/register').send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      });

      const res = await agent.patch('/api/v1/auth/me').send({
        name: 'Alice Updated',
        email: 'ALICE.NEW@example.com',
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({
        id: expect.any(String),
        name: 'Alice Updated',
        email: 'alice.new@example.com',
      });
    });

    it('returns 409 CONFLICT when changing email to one already taken', async () => {
      const app = createApp();
      await request(app).post('/api/v1/auth/register').send({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'password123',
      });

      const agent = request.agent(app);
      await agent.post('/api/v1/auth/register').send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      });

      const res = await agent.patch('/api/v1/auth/me').send({
        name: 'Alice',
        email: 'bob@example.com',
      });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('PATCH /api/v1/auth/password', () => {
    it('changes password when currentPassword matches and rejects wrong currentPassword', async () => {
      const app = createApp();
      const agent = request.agent(app);

      await agent.post('/api/v1/auth/register').send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      });

      const wrongRes = await agent.patch('/api/v1/auth/password').send({
        currentPassword: 'wrong-password',
        newPassword: 'newpassword123',
      });
      expect(wrongRes.status).toBe(401);

      const okRes = await agent.patch('/api/v1/auth/password').send({
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      });
      expect(okRes.status).toBe(204);

      const loginNew = await request(app).post('/api/v1/auth/login').send({
        email: 'alice@example.com',
        password: 'newpassword123',
      });
      expect(loginNew.status).toBe(200);
    });
  });
});
