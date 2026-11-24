import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { getOrder, postCreateOrder } from './orders.controller.js';
import { createOrderSchema, orderIdParamsSchema } from './orders.schema.js';

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

// POST /api/v1/orders -> create PENDING order + Stripe Checkout Session
ordersRouter.post('/', validate({ body: createOrderSchema }), postCreateOrder);

// GET /api/v1/orders/:id -> fetch order details (used for checkout status polling)
ordersRouter.get('/:id', validate({ params: orderIdParamsSchema }), getOrder);
