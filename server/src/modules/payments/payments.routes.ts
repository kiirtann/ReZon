import { Router } from 'express';
import { postSimulateWebhook, postStripeWebhook } from './payments.controller.js';

export const paymentsRouter = Router();

// POST /api/v1/webhooks/stripe -> Stripe webhook receiver (raw body required)
paymentsRouter.post('/stripe', postStripeWebhook);

// POST /api/v1/webhooks/stripe/simulate -> dev-only simulated Stripe event trigger
paymentsRouter.post('/stripe/simulate', postSimulateWebhook);
