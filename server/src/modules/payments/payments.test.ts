import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { getStripeClient } from '../../lib/stripe.js';
import { resetDb } from '../../test/db.js';

interface PaymentFixtures {
  orderId: string;
  cableId: string;
  headphonesId: string;
}

async function seedPaymentFixtures(): Promise<PaymentFixtures> {
  const user = await prisma.user.create({
    data: {
      name: 'Buyer',
      email: 'buyer@example.com',
      passwordHash: 'hashed-password',
    },
  });

  const electronics = await prisma.category.create({
    data: { name: 'Electronics', slug: 'electronics' },
  });

  const cable = await prisma.product.create({
    data: {
      name: 'USB-C Cable',
      slug: 'usb-c-cable',
      description: 'Braided fast charging cable',
      priceCents: 49900,
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
      priceCents: 199900,
      stock: 5,
      imageUrl: 'https://picsum.photos/seed/wireless-headphones/600/600',
      isActive: true,
      categoryId: electronics.id,
    },
  });

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: 'PENDING',
      currency: 'inr',
      subtotalCents: 299700,
      shippingCents: 0,
      totalCents: 299700,
      stripeSessionId: 'cs_test_session_1',
      shippingAddress: JSON.stringify({
        fullName: 'Buyer',
        line1: '1 Main St',
        city: 'Bengaluru',
        state: 'KA',
        postalCode: '560001',
        country: 'India',
        phone: '+919876543210',
      }),
      items: {
        create: [
          {
            productId: cable.id,
            productName: cable.name,
            unitPriceCents: cable.priceCents,
            quantity: 2,
          },
          {
            productId: headphones.id,
            productName: headphones.name,
            unitPriceCents: headphones.priceCents,
            quantity: 1,
          },
        ],
      },
    },
  });

  return {
    orderId: order.id,
    cableId: cable.id,
    headphonesId: headphones.id,
  };
}

function signStripeEvent(
  eventType: string,
  orderId: string,
): { payload: string; signature: string } {
  const payload = JSON.stringify({
    id: `evt_test_${eventType}`,
    object: 'event',
    type: eventType,
    data: {
      object: {
        id: 'cs_test_session_1',
        object: 'checkout.session',
        metadata: { orderId },
      },
    },
  });

  const signature = getStripeClient().webhooks.generateTestHeaderString({
    payload,
    secret: env.STRIPE_WEBHOOK_SECRET,
  });

  return { payload, signature };
}

describe('Payments Webhook API', () => {
  let fixtures: PaymentFixtures;

  beforeEach(async () => {
    await resetDb();
    fixtures = await seedPaymentFixtures();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/webhooks/stripe', () => {
    it('rejects missing or invalid Stripe signatures with 400', async () => {
      const missingSig = await request(createApp())
        .post('/api/v1/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' }));
      expect(missingSig.status).toBe(400);
      expect(missingSig.body.error.code).toBe('VALIDATION_ERROR');

      const invalidSig = await request(createApp())
        .post('/api/v1/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .set('Stripe-Signature', 't=12345,v1=invalid_signature')
        .send(JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' }));
      expect(invalidSig.status).toBe(400);
      expect(invalidSig.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('marks order PAID, sets paidAt, and decrements stock on checkout.session.completed', async () => {
      const { payload, signature } = signStripeEvent(
        'checkout.session.completed',
        fixtures.orderId,
      );

      const res = await request(createApp())
        .post('/api/v1/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .set('Stripe-Signature', signature)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ received: true });

      const order = await prisma.order.findUnique({ where: { id: fixtures.orderId } });
      expect(order?.status).toBe('PAID');
      expect(order?.paidAt).not.toBeNull();

      const cable = await prisma.product.findUnique({ where: { id: fixtures.cableId } });
      const headphones = await prisma.product.findUnique({ where: { id: fixtures.headphonesId } });
      expect(cable?.stock).toBe(8); // 10 - 2
      expect(headphones?.stock).toBe(4); // 5 - 1
    });

    it('is idempotent when checkout.session.completed is delivered multiple times', async () => {
      const { payload, signature } = signStripeEvent(
        'checkout.session.completed',
        fixtures.orderId,
      );

      const firstRes = await request(createApp())
        .post('/api/v1/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .set('Stripe-Signature', signature)
        .send(payload);
      expect(firstRes.status).toBe(200);

      const secondRes = await request(createApp())
        .post('/api/v1/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .set('Stripe-Signature', signature)
        .send(payload);
      expect(secondRes.status).toBe(200);
      expect(secondRes.body).toEqual({ received: true });

      const cable = await prisma.product.findUnique({ where: { id: fixtures.cableId } });
      const headphones = await prisma.product.findUnique({ where: { id: fixtures.headphonesId } });
      expect(cable?.stock).toBe(8);
      expect(headphones?.stock).toBe(4);
    });

    it('marks PENDING order CANCELLED on checkout.session.expired without changing stock', async () => {
      const { payload, signature } = signStripeEvent('checkout.session.expired', fixtures.orderId);

      const res = await request(createApp())
        .post('/api/v1/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .set('Stripe-Signature', signature)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ received: true });

      const order = await prisma.order.findUnique({ where: { id: fixtures.orderId } });
      expect(order?.status).toBe('CANCELLED');

      const cable = await prisma.product.findUnique({ where: { id: fixtures.cableId } });
      const headphones = await prisma.product.findUnique({ where: { id: fixtures.headphonesId } });
      expect(cable?.stock).toBe(10);
      expect(headphones?.stock).toBe(5);
    });
  });
});
