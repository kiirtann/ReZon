import type Stripe from 'stripe';
import { validationError } from '../../lib/errors.js';
import { prisma } from '../../lib/prisma.js';
import { constructWebhookEvent } from '../../lib/stripe.js';

/**
 * Verifies a Stripe webhook payload and processes payment lifecycle events.
 * - `checkout.session.completed`: marks PENDING order PAID, sets paidAt, and decrements stock
 *   in a single transaction. Idempotent: already-PAID orders are ignored.
 * - `checkout.session.expired`: marks PENDING order CANCELLED.
 */
export async function handleStripeWebhook(
  rawBody: Buffer,
  signature: string | undefined,
): Promise<void> {
  if (!signature) {
    throw validationError('Missing Stripe-Signature header');
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch {
    throw validationError('Invalid Stripe webhook signature');
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        return;
      }

      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            status: true,
            items: {
              select: {
                productId: true,
                quantity: true,
              },
            },
          },
        });

        if (!order) {
          return;
        }

        // Idempotency: Stripe may deliver the same webhook event more than once.
        if (order.status === 'PAID') {
          return;
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }
      });
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        return;
      }

      await prisma.order.updateMany({
        where: { id: orderId, status: 'PENDING' },
        data: { status: 'CANCELLED' },
      });
      break;
    }

    default:
      // Unhandled event types are acknowledged with 200 so Stripe does not retry them.
      break;
  }
}
