import request from 'supertest';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { setCheckoutSessionCreatorForTest } from '../../lib/stripe.js';
import { resetDb } from '../../test/db.js';

const validShippingAddress = {
  fullName: 'Aarav Sharma',
  line1: '42 MG Road',
  line2: 'Apt 3B',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560001',
  country: 'India',
  phone: '+919876543210',
};

interface TestFixtures {
  ownerCookie: string;
  otherCookie: string;
  cableId: string;
  headphonesId: string;
  lowStockId: string;
  inactiveId: string;
}

async function registerAndGetCookie(
  app: ReturnType<typeof createApp>,
  name: string,
  email: string,
): Promise<string> {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ name, email, password: 'Password123!' });
  expect(res.status).toBe(201);
  const setCookie = res.headers['set-cookie'];
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  return cookies[0].split(';')[0];
}

async function seedOrderFixtures(): Promise<TestFixtures> {
  const app = createApp();
  const ownerCookie = await registerAndGetCookie(app, 'Owner User', 'owner@example.com');
  const otherCookie = await registerAndGetCookie(app, 'Other User', 'other@example.com');

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
      priceCents: 79900,
      stock: 2,
      imageUrl: 'https://picsum.photos/seed/travel-adapter/600/600',
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
    ownerCookie,
    otherCookie,
    cableId: cable.id,
    headphonesId: headphones.id,
    lowStockId: lowStock.id,
    inactiveId: inactive.id,
  };
}

describe('Orders API', () => {
  let fixtures: TestFixtures;
  const mockCreateSession = vi.fn();

  beforeEach(async () => {
    await resetDb();
    fixtures = await seedOrderFixtures();
    mockCreateSession.mockReset();
    mockCreateSession.mockImplementation(async ({ orderId }) => ({
      id: `cs_test_${orderId}`,
      url: `https://checkout.stripe.test/pay/cs_test_${orderId}`,
    }));
    setCheckoutSessionCreatorForTest(mockCreateSession);
  });

  afterEach(() => {
    setCheckoutSessionCreatorForTest(null);
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/orders', () => {
    it('requires authentication (401)', async () => {
      const res = await request(createApp())
        .post('/api/v1/orders')
        .send({
          items: [{ productId: fixtures.cableId, quantity: 1 }],
          shippingAddress: validShippingAddress,
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('creates a PENDING order with DB price snapshots and returns checkoutUrl (201)', async () => {
      const res = await request(createApp())
        .post('/api/v1/orders')
        .set('Cookie', fixtures.ownerCookie)
        .send({
          items: [
            { productId: fixtures.cableId, quantity: 1 },
            { productId: fixtures.cableId, quantity: 1 }, // duplicate merged to 2
          ],
          shippingAddress: validShippingAddress,
        });

      expect(res.status).toBe(201);
      const { order, checkoutUrl } = res.body.data;
      expect(order.status).toBe('PENDING');
      expect(order.currency).toBe('inr');
      expect(order.subtotalCents).toBe(99800);
      expect(order.shippingCents).toBe(4900); // below ₹999 threshold
      expect(order.totalCents).toBe(104700);
      expect(order.shippingAddress).toEqual(validShippingAddress);
      expect(order.paidAt).toBeNull();
      expect(order.items).toEqual([
        {
          productId: fixtures.cableId,
          productName: 'USB-C Cable',
          unitPriceCents: 49900,
          quantity: 2,
        },
      ]);
      expect(checkoutUrl).toBe(`https://checkout.stripe.test/pay/cs_test_${order.id}`);
      expect(mockCreateSession).toHaveBeenCalledTimes(1);

      // Verify stripeSessionId persisted and price snapshot is isolated from later product edits
      const dbOrder = await prisma.order.findUnique({ where: { id: order.id } });
      expect(dbOrder?.stripeSessionId).toBe(`cs_test_${order.id}`);

      await prisma.product.update({
        where: { id: fixtures.cableId },
        data: { priceCents: 99900 },
      });

      const fetched = await request(createApp())
        .get(`/api/v1/orders/${order.id}`)
        .set('Cookie', fixtures.ownerCookie);
      expect(fetched.status).toBe(200);
      expect(fetched.body.data.items[0].unitPriceCents).toBe(49900);
    });

    it('returns 409 CONFLICT when stock is insufficient, product is inactive, or product is missing', async () => {
      const res = await request(createApp())
        .post('/api/v1/orders')
        .set('Cookie', fixtures.ownerCookie)
        .send({
          items: [
            { productId: fixtures.lowStockId, quantity: 5 },
            { productId: fixtures.inactiveId, quantity: 1 },
            { productId: 'missing-product-id', quantity: 1 },
          ],
          shippingAddress: validShippingAddress,
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.details.issues).toEqual([
        { productId: fixtures.lowStockId, type: 'INSUFFICIENT_STOCK', available: 2 },
        { productId: fixtures.inactiveId, type: 'INACTIVE' },
        { productId: 'missing-product-id', type: 'NOT_FOUND' },
      ]);
      expect(mockCreateSession).not.toHaveBeenCalled();
    });

    it('returns 400 VALIDATION_ERROR for invalid request body', async () => {
      const emptyItems = await request(createApp())
        .post('/api/v1/orders')
        .set('Cookie', fixtures.ownerCookie)
        .send({ items: [], shippingAddress: validShippingAddress });
      expect(emptyItems.status).toBe(400);
      expect(emptyItems.body.error.code).toBe('VALIDATION_ERROR');

      const missingAddress = await request(createApp())
        .post('/api/v1/orders')
        .set('Cookie', fixtures.ownerCookie)
        .send({ items: [{ productId: fixtures.cableId, quantity: 1 }] });
      expect(missingAddress.status).toBe(400);
      expect(missingAddress.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/orders', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(createApp()).get('/api/v1/orders');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('returns only the current user orders, newest first, without leaking other users orders', async () => {
      const app = createApp();

      const firstOwnerRes = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', fixtures.ownerCookie)
        .send({
          items: [{ productId: fixtures.cableId, quantity: 1 }],
          shippingAddress: validShippingAddress,
        });
      expect(firstOwnerRes.status).toBe(201);
      const firstOrderId = firstOwnerRes.body.data.order.id as string;

      const otherUserRes = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', fixtures.otherCookie)
        .send({
          items: [{ productId: fixtures.lowStockId, quantity: 1 }],
          shippingAddress: validShippingAddress,
        });
      expect(otherUserRes.status).toBe(201);
      const otherOrderId = otherUserRes.body.data.order.id as string;

      // Ensure a distinct createdAt timestamp so newest-first ordering is deterministic
      await prisma.order.update({
        where: { id: firstOrderId },
        data: { createdAt: new Date(Date.now() - 10_000) },
      });

      const secondOwnerRes = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', fixtures.ownerCookie)
        .send({
          items: [{ productId: fixtures.headphonesId, quantity: 1 }],
          shippingAddress: validShippingAddress,
        });
      expect(secondOwnerRes.status).toBe(201);
      const secondOrderId = secondOwnerRes.body.data.order.id as string;

      const ownerListRes = await request(app)
        .get('/api/v1/orders')
        .set('Cookie', fixtures.ownerCookie);
      expect(ownerListRes.status).toBe(200);
      expect(ownerListRes.body.data).toHaveLength(2);
      expect(ownerListRes.body.data.map((o: { id: string }) => o.id)).toEqual([
        secondOrderId,
        firstOrderId,
      ]);
      expect(ownerListRes.body.data[0].items[0].productName).toBe('Wireless Headphones');
      expect(ownerListRes.body.data[1].items[0].productName).toBe('USB-C Cable');

      const otherListRes = await request(app)
        .get('/api/v1/orders')
        .set('Cookie', fixtures.otherCookie);
      expect(otherListRes.status).toBe(200);
      expect(otherListRes.body.data).toHaveLength(1);
      expect(otherListRes.body.data[0].id).toBe(otherOrderId);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('returns 200 for owner, 403 for non-owner, and 404 for missing order', async () => {
      const createRes = await request(createApp())
        .post('/api/v1/orders')
        .set('Cookie', fixtures.ownerCookie)
        .send({
          items: [{ productId: fixtures.headphonesId, quantity: 1 }],
          shippingAddress: validShippingAddress,
        });
      expect(createRes.status).toBe(201);
      const orderId = createRes.body.data.order.id as string;

      const ownerRes = await request(createApp())
        .get(`/api/v1/orders/${orderId}`)
        .set('Cookie', fixtures.ownerCookie);
      expect(ownerRes.status).toBe(200);
      expect(ownerRes.body.data.id).toBe(orderId);
      expect(ownerRes.body.data.shippingCents).toBe(0); // ₹1,999 >= ₹999 free shipping

      const otherRes = await request(createApp())
        .get(`/api/v1/orders/${orderId}`)
        .set('Cookie', fixtures.otherCookie);
      expect(otherRes.status).toBe(403);
      expect(otherRes.body.error.code).toBe('FORBIDDEN');

      const missingRes = await request(createApp())
        .get('/api/v1/orders/non-existent-order-id')
        .set('Cookie', fixtures.ownerCookie);
      expect(missingRes.status).toBe(404);
      expect(missingRes.body.error.code).toBe('NOT_FOUND');
    });
  });
});
