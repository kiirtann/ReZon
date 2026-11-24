import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { resetDb } from '../../test/db.js';

interface SeededProducts {
  cableId: string;
  headphonesId: string;
  lowStockId: string;
  zeroStockId: string;
  inactiveId: string;
}

async function seedCartFixtures(): Promise<SeededProducts> {
  const electronics = await prisma.category.create({
    data: { name: 'Electronics', slug: 'electronics' },
  });

  const cable = await prisma.product.create({
    data: {
      name: 'USB-C Cable',
      slug: 'usb-c-cable',
      description: 'Braided fast charging cable',
      priceCents: 49900, // ₹499.00
      stock: 10,
      imageUrl: 'https://picsum.photos/seed/usb-c-cable/600/600',
      isActive: true,
      categoryId: electronics.id,
    },
  });

  const headphones = await prisma.product.create({
    data: {
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      description: 'Noise-cancelling over-ear headphones',
      priceCents: 199900, // ₹1,999.00
      stock: 5,
      imageUrl: 'https://picsum.photos/seed/wireless-headphones/600/600',
      isActive: true,
      categoryId: electronics.id,
    },
  });

  const lowStock = await prisma.product.create({
    data: {
      name: 'Travel Adapter',
      slug: 'travel-adapter',
      description: 'Universal travel adapter',
      priceCents: 79900, // ₹799.00
      stock: 2,
      imageUrl: 'https://picsum.photos/seed/travel-adapter/600/600',
      isActive: true,
      categoryId: electronics.id,
    },
  });

  const zeroStock = await prisma.product.create({
    data: {
      name: 'Mechanical Keyboard',
      slug: 'mechanical-keyboard',
      description: 'Compact wireless keyboard',
      priceCents: 399900,
      stock: 0,
      imageUrl: 'https://picsum.photos/seed/mechanical-keyboard/600/600',
      isActive: true,
      categoryId: electronics.id,
    },
  });

  const inactive = await prisma.product.create({
    data: {
      name: 'Discontinued Speaker',
      slug: 'discontinued-speaker',
      description: 'No longer sold',
      priceCents: 99900,
      stock: 4,
      imageUrl: 'https://picsum.photos/seed/discontinued-speaker/600/600',
      isActive: false,
      categoryId: electronics.id,
    },
  });

  return {
    cableId: cable.id,
    headphonesId: headphones.id,
    lowStockId: lowStock.id,
    zeroStockId: zeroStock.id,
    inactiveId: inactive.id,
  };
}

describe('Cart API', () => {
  let fixtures: SeededProducts;

  beforeEach(async () => {
    await resetDb();
    fixtures = await seedCartFixtures();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/cart/validate', () => {
    it('computes totals and applies ₹49 shipping when subtotal is below ₹999', async () => {
      const res = await request(createApp())
        .post('/api/v1/cart/validate')
        .send({
          items: [{ productId: fixtures.cableId, quantity: 1 }],
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({
        items: [
          {
            product: {
              id: fixtures.cableId,
              name: 'USB-C Cable',
              slug: 'usb-c-cable',
              priceCents: 49900,
              imageUrl: 'https://picsum.photos/seed/usb-c-cable/600/600',
              stock: 10,
              category: {
                id: expect.any(String),
                name: 'Electronics',
                slug: 'electronics',
              },
            },
            quantity: 1,
            lineTotalCents: 49900,
          },
        ],
        subtotalCents: 49900,
        shippingCents: 4900,
        totalCents: 54800,
        currency: 'inr',
        issues: [],
      });
    });

    it('applies free shipping when subtotal meets or exceeds ₹999', async () => {
      const res = await request(createApp())
        .post('/api/v1/cart/validate')
        .send({
          // 2 * ₹499.00 = ₹998.00 would be paid; test >= ₹999.00 via headphones + cable
          items: [
            { productId: fixtures.headphonesId, quantity: 1 },
            { productId: fixtures.cableId, quantity: 1 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.subtotalCents).toBe(249800);
      expect(res.body.data.shippingCents).toBe(0);
      expect(res.body.data.totalCents).toBe(249800);
      expect(res.body.data.currency).toBe('inr');
      expect(res.body.data.issues).toEqual([]);
    });

    it('merges duplicate productId entries and sums their quantities', async () => {
      const res = await request(createApp())
        .post('/api/v1/cart/validate')
        .send({
          items: [
            { productId: fixtures.cableId, quantity: 1 },
            { productId: fixtures.cableId, quantity: 1 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.items[0].lineTotalCents).toBe(99800);
      // 99,800 < 99,900 so ₹49 shipping still applies
      expect(res.body.data.shippingCents).toBe(4900);
      expect(res.body.data.totalCents).toBe(104700);
      expect(res.body.data.issues).toEqual([]);
    });

    it('reports NOT_FOUND, INACTIVE, and INSUFFICIENT_STOCK issues accurately', async () => {
      const res = await request(createApp())
        .post('/api/v1/cart/validate')
        .send({
          items: [
            { productId: 'non-existent-id', quantity: 1 },
            { productId: fixtures.inactiveId, quantity: 1 },
            { productId: fixtures.lowStockId, quantity: 5 },
            { productId: fixtures.zeroStockId, quantity: 1 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.issues).toEqual([
        { productId: 'non-existent-id', type: 'NOT_FOUND' },
        { productId: fixtures.inactiveId, type: 'INACTIVE' },
        { productId: fixtures.lowStockId, type: 'INSUFFICIENT_STOCK', available: 2 },
        { productId: fixtures.zeroStockId, type: 'INSUFFICIENT_STOCK', available: 0 },
      ]);
      // Only the active product with stock > 0 is returned in items, capped at available stock (2)
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].product.id).toBe(fixtures.lowStockId);
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.items[0].lineTotalCents).toBe(159800);
      expect(res.body.data.subtotalCents).toBe(159800);
      expect(res.body.data.shippingCents).toBe(0);
      expect(res.body.data.totalCents).toBe(159800);
    });

    it('handles an empty cart with zero totals and no issues', async () => {
      const res = await request(createApp()).post('/api/v1/cart/validate').send({ items: [] });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({
        items: [],
        subtotalCents: 0,
        shippingCents: 0,
        totalCents: 0,
        currency: 'inr',
        issues: [],
      });
    });

    it('returns 400 validation error for invalid request bodies', async () => {
      const missingItems = await request(createApp()).post('/api/v1/cart/validate').send({});
      expect(missingItems.status).toBe(400);
      expect(missingItems.body.error.code).toBe('VALIDATION_ERROR');

      const badQty = await request(createApp())
        .post('/api/v1/cart/validate')
        .send({ items: [{ productId: fixtures.cableId, quantity: 0 }] });
      expect(badQty.status).toBe(400);
      expect(badQty.body.error.code).toBe('VALIDATION_ERROR');

      const floatQty = await request(createApp())
        .post('/api/v1/cart/validate')
        .send({ items: [{ productId: fixtures.cableId, quantity: 1.5 }] });
      expect(floatQty.status).toBe(400);
      expect(floatQty.body.error.code).toBe('VALIDATION_ERROR');

      const emptyProductId = await request(createApp())
        .post('/api/v1/cart/validate')
        .send({ items: [{ productId: '', quantity: 1 }] });
      expect(emptyProductId.status).toBe(400);
      expect(emptyProductId.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
