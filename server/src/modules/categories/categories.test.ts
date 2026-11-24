import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { resetDb } from '../../test/db.js';

describe('GET /api/v1/categories', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  it('returns categories ordered alphabetically by name in { data } envelope', async () => {
    await prisma.category.createMany({
      data: [
        { name: 'Home & Kitchen', slug: 'home-kitchen' },
        { name: 'Books', slug: 'books' },
        { name: 'Electronics', slug: 'electronics' },
      ],
    });

    const res = await request(createApp()).get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data.map((c: { name: string }) => c.name)).toEqual([
      'Books',
      'Electronics',
      'Home & Kitchen',
    ]);
    expect(res.body.data[0]).toEqual({
      id: expect.any(String),
      name: 'Books',
      slug: 'books',
    });
  });

  it('returns an empty array when there are no categories', async () => {
    const res = await request(createApp()).get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });
});
