import { Router } from 'express';
import { postStripeWebhook } from './payments.controller.js';

export const paymentsRouter = Router();

// POST /api/v1/webhooks/stripe -> Stripe webhook receiver (raw body required)
paymentsRouter.post('/stripe', postStripeWebhook);
