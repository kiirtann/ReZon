import type { Request, Response } from 'express';
import { z } from 'zod';
import { validationError } from '../../lib/errors.js';
import { handleStripeWebhook, simulateStripeWebhook } from './payments.service.js';

const simulateSchema = z.object({
  orderId: z.string().min(1),
  action: z.enum(['complete', 'expire']),
});

export async function postStripeWebhook(req: Request, res: Response): Promise<void> {
  const signatureHeader = req.headers['stripe-signature'];
  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);

  await handleStripeWebhook(rawBody, signature);
  res.status(200).json({ received: true });
}

export async function postSimulateWebhook(req: Request, res: Response): Promise<void> {
  const raw = Buffer.isBuffer(req.body)
    ? req.body.toString('utf8')
    : JSON.stringify(req.body ?? {});
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    throw validationError('Invalid JSON payload');
  }

  const parsed = simulateSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw validationError('Validation failed', parsed.error.flatten().fieldErrors);
  }

  await simulateStripeWebhook(parsed.data.orderId, parsed.data.action);
  res.status(200).json({ data: { simulated: true } });
}
