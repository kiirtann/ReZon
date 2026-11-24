import type { Request, Response } from 'express';
import { handleStripeWebhook } from './payments.service.js';

export async function postStripeWebhook(req: Request, res: Response): Promise<void> {
  const signatureHeader = req.headers['stripe-signature'];
  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);

  await handleStripeWebhook(rawBody, signature);
  res.status(200).json({ received: true });
}
