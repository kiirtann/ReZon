import { env } from '../../config/env.js';
import { conflictError, forbiddenError, notFoundError } from '../../lib/errors.js';
import { computeTotals } from '../../lib/pricing.js';
import { prisma } from '../../lib/prisma.js';
import { createCheckoutSession } from '../../lib/stripe.js';
import type { CreateOrderInput, ShippingAddress } from './orders.schema.js';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';

export interface OrderItemDto {
  productId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
}

export interface OrderDto {
  id: string;
  status: OrderStatus;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress: ShippingAddress;
  items: OrderItemDto[];
  createdAt: string;
  paidAt: string | null;
}

export interface CreateOrderResult {
  order: OrderDto;
  checkoutUrl: string;
}

type OrderAvailabilityIssue =
  | { productId: string; type: 'NOT_FOUND' }
  | { productId: string; type: 'INACTIVE' }
  | { productId: string; type: 'INSUFFICIENT_STOCK'; available: number };

interface OrderRecordWithItems {
  id: string;
  status: string;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress: string;
  createdAt: Date;
  paidAt: Date | null;
  items: OrderItemDto[];
}

function toOrderDto(order: OrderRecordWithItems): OrderDto {
  return {
    id: order.id,
    status: order.status as OrderStatus,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    shippingAddress: JSON.parse(order.shippingAddress) as ShippingAddress,
    items: order.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
    })),
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
  };
}

/**
 * Creates a PENDING order from authoritative DB product prices and initiates a Stripe Checkout Session.
 * - Merges duplicate productIds.
 * - Rejects with 409 CONFLICT if any product is missing, inactive, or has insufficient stock.
 * - Snapshots productName and unitPriceCents onto OrderItem so later price edits never alter past orders.
 */
export async function createOrder(
  userId: string,
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const mergedQuantities = new Map<string, number>();
  for (const item of input.items) {
    mergedQuantities.set(
      item.productId,
      (mergedQuantities.get(item.productId) ?? 0) + item.quantity,
    );
  }

  const productIds = Array.from(mergedQuantities.keys());
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      priceCents: true,
      stock: true,
      isActive: true,
    },
  });

  const productById = new Map(products.map((product) => [product.id, product]));
  const issues: OrderAvailabilityIssue[] = [];
  const lineItems: Array<{
    productId: string;
    productName: string;
    unitPriceCents: number;
    quantity: number;
  }> = [];

  for (const [productId, quantity] of mergedQuantities.entries()) {
    const product = productById.get(productId);
    if (!product) {
      issues.push({ productId, type: 'NOT_FOUND' });
      continue;
    }
    if (!product.isActive) {
      issues.push({ productId, type: 'INACTIVE' });
      continue;
    }
    if (product.stock < quantity) {
      issues.push({ productId, type: 'INSUFFICIENT_STOCK', available: product.stock });
      continue;
    }

    lineItems.push({
      productId: product.id,
      productName: product.name,
      unitPriceCents: product.priceCents,
      quantity,
    });
  }

  if (issues.length > 0) {
    throw conflictError('One or more items are unavailable or have insufficient stock', {
      issues,
    });
  }

  const totals = computeTotals(
    lineItems.map((item) => ({
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
    })),
  );

  const createdOrder = await prisma.$transaction(async (tx) => {
    return tx.order.create({
      data: {
        userId,
        status: 'PENDING',
        currency: env.CURRENCY,
        subtotalCents: totals.subtotalCents,
        shippingCents: totals.shippingCents,
        totalCents: totals.totalCents,
        shippingAddress: JSON.stringify(input.shippingAddress),
        items: {
          create: lineItems,
        },
      },
      include: {
        items: {
          select: {
            productId: true,
            productName: true,
            unitPriceCents: true,
            quantity: true,
          },
        },
      },
    });
  });

  const session = await createCheckoutSession({
    orderId: createdOrder.id,
    currency: env.CURRENCY,
    items: lineItems.map((item) => ({
      name: item.productName,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
    })),
    shippingCents: totals.shippingCents,
  });

  const updatedOrder = await prisma.order.update({
    where: { id: createdOrder.id },
    data: { stripeSessionId: session.id },
    include: {
      items: {
        select: {
          productId: true,
          productName: true,
          unitPriceCents: true,
          quantity: true,
        },
      },
    },
  });

  return {
    order: toOrderDto(updatedOrder),
    checkoutUrl: session.url,
  };
}

/**
 * Fetches a single order by ID, ensuring it belongs to the requesting user.
 */
export async function getOrderById(userId: string, orderId: string): Promise<OrderDto> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          productId: true,
          productName: true,
          unitPriceCents: true,
          quantity: true,
        },
      },
    },
  });

  if (!order) {
    throw notFoundError('Order not found');
  }

  if (order.userId !== userId) {
    throw forbiddenError('You do not have permission to view this order');
  }

  return toOrderDto(order);
}

/**
 * Lists all orders belonging to a user, ordered newest first.
 */
export async function listOrdersByUser(userId: string): Promise<OrderDto[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });

  return orders.map(toOrderDto);
}
