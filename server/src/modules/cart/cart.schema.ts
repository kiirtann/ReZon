import { z } from 'zod';

export const cartItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const validateCartSchema = z.object({
  items: z.array(cartItemInputSchema).max(50),
});

export type CartItemInput = z.infer<typeof cartItemInputSchema>;
export type ValidateCartInput = z.infer<typeof validateCartSchema>;
