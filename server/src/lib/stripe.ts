import Stripe from 'stripe';
import { env } from '../config/env.js';
import { AppError } from './errors.js';

export interface CheckoutLineItem {
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export interface CreateCheckoutSessionParams {
  orderId: string;
  currency: string;
  items: CheckoutLineItem[];
  shippingCents: number;
  customerEmail?: string;
}

export interface CreatedCheckoutSession {
  id: string;
  url: string;
}

type CheckoutSessionCreator = (
  params: CreateCheckoutSessionParams,
) => Promise<CreatedCheckoutSession>;

let stripeClient: Stripe | null = null;
let customSessionCreator: CheckoutSessionCreator | null = null;

/**
 * Returns a lazy-initialized Stripe SDK client.
 * Falls back to a placeholder key when STRIPE_SECRET_KEY is unset so offline
 * webhook signature verification (which only uses STRIPE_WEBHOOK_SECRET) works in tests.
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
  }
  return stripeClient;
}

/**
 * Allows tests to replace Checkout Session creation without making network calls.
 * Pass `null` to restore the default Stripe SDK implementation.
 */
export function setCheckoutSessionCreatorForTest(creator: CheckoutSessionCreator | null): void {
  customSessionCreator = creator;
}

/**
 * Creates a Stripe Checkout Session in payment mode for an order.
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
): Promise<CreatedCheckoutSession> {
  if (customSessionCreator) {
    return customSessionCreator(params);
  }

  if (!env.STRIPE_SECRET_KEY) {
    throw new AppError(500, 'INTERNAL_ERROR', 'Stripe secret key is not configured');
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.items.map((item) => ({
    price_data: {
      currency: params.currency,
      product_data: {
        name: item.name,
      },
      unit_amount: item.unitPriceCents,
    },
    quantity: item.quantity,
  }));

  if (params.shippingCents > 0) {
    lineItems.push({
      price_data: {
        currency: params.currency,
        product_data: {
          name: 'Standard Shipping',
        },
        unit_amount: params.shippingCents,
      },
      quantity: 1,
    });
  }

  const session = await getStripeClient().checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    metadata: {
      orderId: params.orderId,
    },
    ...(params.customerEmail ? { customer_email: params.customerEmail } : {}),
    success_url: `${env.CLIENT_URL}/checkout/success?orderId=${params.orderId}`,
    cancel_url: `${env.CLIENT_URL}/checkout/cancel?orderId=${params.orderId}`,
  });

  if (!session.url) {
    throw new AppError(500, 'INTERNAL_ERROR', 'Stripe did not return a checkout URL');
  }

  return {
    id: session.id,
    url: session.url,
  };
}

/**
 * Verifies the Stripe webhook signature and constructs the typed event.
 */
export function constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
  return getStripeClient().webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
}
