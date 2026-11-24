import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { resetDb } from '../../test/db.js';

async function seedProducts() {
  const electronics = await prisma.category.create({
    data: { name: 'Electronics', slug: 'electronics' },
  });
  const books = await prisma.category.create({
    data: { name: 'Books', slug: 'books' },
  });

  await prisma.product.create({
    data: {
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      description: 'Noise-cancelling over-ear headphones',
      priceCents: 299900,
      stock: 15,
      imageUrl: 'https://picsum.photos/seed/wireless-headphones/600/600',
      isActive: true,
      categoryId: electronics.id,
      createdAt: new Date('2026-01-01T10:00:00Z'),
    },
  });

  await prisma.product.create({
    data: {
      name: 'USB-C Cable',
      slug: 'usb-c-cable',
      description: 'Braided fast charging cable',
      priceCents: 49900,
      stock: 50,
      imageUrl: 'https://picsum.photos/seed/usb-c-cable/600/600',
      isActive: true,
      categoryId: electronics.id,
      createdAt: new Date('2026-01-02T10:00:00Z'),
    },
  });

  await prisma.product.create({
    data: {
      name: 'Clean Code Handbook',
      slug: 'clean-code-handbook',
      description: 'A practical guide to software craftsmanship and headphones focus',
      priceCents: 149900,
      stock: 8,
      imageUrl: 'https://picsum.photos/seed/clean-code-handbook/600/600',
      isActive: true,
      categoryId: books.id,
      createdAt: new Date('2026-01-03T10:00:00Z'),
    },
  });

  await prisma.product.create({
    data: {
      name: 'Discontinued Speaker',
      slug: 'discontinued-speaker',
      description: 'Should never appear in public catalog endpoints',
      priceCents: 99900,
      stock: 0,
      imageUrl: 'https://picsum.photos/seed/discontinued-speaker/600/600',
      isActive: false,
      categoryId: electronics.id,
      createdAt: new Date('2026-01-04T10:00:00Z'),
    },
  });
}

describe('Products API', () => {
  beforeEach(async () => {
    await resetDb();
    await seedProducts();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  describe('GET /api/v1/products', () => {
    it('returns only active products with default newest sort and pagination meta', async () => {
      const res = await request(createApp()).get('/api/v1/products');

      expect(res.status).toBe(200);
      expect(res.body.meta).toEqual({
        page: 1,
        limit: 12,
        total: 3,
        totalPages: 1,
      });
      expect(res.body.data.map((p: { slug: string }) => p.slug)).toEqual([
        'clean-code-handbook',
        'usb-c-cable',
        'wireless-headphones',
      ]);
      // ProductSummary does not include description
      expect(res.body.data[0]).not.toHaveProperty('description');
      expect(res.body.data[0].category).toEqual({
        id: expect.any(String),
        name: 'Books',
        slug: 'books',
      });
    });

    it('filters by search across name and description', async () => {
      const res = await request(createApp()).get('/api/v1/products?search=headphones');

      expect(res.status).toBe(200);
      expect(res.body.meta.total).toBe(2);
      expect(res.body.data.map((p: { slug: string }) => p.slug)).toEqual([
        'clean-code-handbook',
        'wireless-headphones',
      ]);
    });

    it('filters by category slug', async () => {
      const res = await request(createApp()).get('/api/v1/products?category=electronics');

      expect(res.status).toBe(200);
      expect(res.body.meta.total).toBe(2);
      expect(res.body.data.map((p: { slug: string }) => p.slug)).toEqual([
        'usb-c-cable',
        'wireless-headphones',
      ]);
    });

    it('filters by inclusive minPrice and maxPrice', async () => {
      const res = await request(createApp()).get('/api/v1/products?minPrice=49900&maxPrice=149900');

      expect(res.status).toBe(200);
      expect(res.body.meta.total).toBe(2);
      expect(res.body.data.map((p: { slug: string }) => p.slug)).toEqual([
        'clean-code-handbook',
        'usb-c-cable',
      ]);
    });

    it('supports price_asc, price_desc, and name_asc sorting', async () => {
      const asc = await request(createApp()).get('/api/v1/products?sort=price_asc');
      expect(asc.status).toBe(200);
      expect(asc.body.data.map((p: { slug: string }) => p.slug)).toEqual([
        'usb-c-cable',
        'clean-code-handbook',
        'wireless-headphones',
      ]);

      const desc = await request(createApp()).get('/api/v1/products?sort=price_desc');
      expect(desc.status).toBe(200);
      expect(desc.body.data.map((p: { slug: string }) => p.slug)).toEqual([
        'wireless-headphones',
        'clean-code-handbook',
        'usb-c-cable',
      ]);

      const byName = await request(createApp()).get('/api/v1/products?sort=name_asc');
      expect(byName.status).toBe(200);
      expect(byName.body.data.map((p: { slug: string }) => p.slug)).toEqual([
        'clean-code-handbook',
        'usb-c-cable',
        'wireless-headphones',
      ]);
    });

    it('paginates with page and limit', async () => {
      const res = await request(createApp()).get('/api/v1/products?sort=price_asc&page=2&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.meta).toEqual({
        page: 2,
        limit: 2,
        total: 3,
        totalPages: 2,
      });
      expect(res.body.data.map((p: { slug: string }) => p.slug)).toEqual(['wireless-headphones']);
    });

    it('returns 400 VALIDATION_ERROR for invalid query parameters', async () => {
      const badPage = await request(createApp()).get('/api/v1/products?page=0');
      expect(badPage.status).toBe(400);
      expect(badPage.body.error.code).toBe('VALIDATION_ERROR');

      const badLimit = await request(createApp()).get('/api/v1/products?limit=49');
      expect(badLimit.status).toBe(400);
      expect(badLimit.body.error.code).toBe('VALIDATION_ERROR');

      const badSort = await request(createApp()).get('/api/v1/products?sort=popular');
      expect(badSort.status).toBe(400);
      expect(badSort.body.error.code).toBe('VALIDATION_ERROR');

      const badPrice = await request(createApp()).get('/api/v1/products?minPrice=-10');
      expect(badPrice.status).toBe(400);
      expect(badPrice.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/products/:slug', () => {
    it('returns full product details including description for an active product', async () => {
      const res = await request(createApp()).get('/api/v1/products/wireless-headphones');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        data: {
          id: expect.any(String),
          name: 'Wireless Headphones',
          slug: 'wireless-headphones',
          description: 'Noise-cancelling over-ear headphones',
          priceCents: 299900,
          stock: 15,
          imageUrl: 'https://picsum.photos/seed/wireless-headphones/600/600',
          category: {
            id: expect.any(String),
            name: 'Electronics',
            slug: 'electronics',
          },
        },
      });
    });

    it('returns 404 NOT_FOUND for an inactive product or unknown slug', async () => {
      const inactive = await request(createApp()).get('/api/v1/products/discontinued-speaker');
      expect(inactive.status).toBe(404);
      expect(inactive.body.error.code).toBe('NOT_FOUND');

      const missing = await request(createApp()).get('/api/v1/products/does-not-exist');
      expect(missing.status).toBe(404);
      expect(missing.body.error.code).toBe('NOT_FOUND');
    });
  });
});
