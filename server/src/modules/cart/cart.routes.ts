import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { postValidateCart } from './cart.controller.js';
import { validateCartSchema } from './cart.schema.js';

export const cartRouter = Router();

// POST /api/v1/cart/validate -> server-side price, availability, and stock check
cartRouter.post('/validate', validate({ body: validateCartSchema }), postValidateCart);
