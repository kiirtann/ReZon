import type { Request, Response } from 'express';
import type { ValidateCartInput } from './cart.schema.js';
import { validateCart } from './cart.service.js';

export async function postValidateCart(req: Request, res: Response): Promise<void> {
  const { items } = req.validated?.body as ValidateCartInput;
  const result = await validateCart(items);
  res.json({ data: result });
}
