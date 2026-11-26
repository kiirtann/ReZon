import { z } from 'zod';

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  line1: z.string().trim().min(1, 'Address line 1 is required').max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  postalCode: z.string().trim().min(1, 'Postal code is required').max(20),
  country: z.string().trim().min(1, 'Country is required').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(\+\d{1,4}\s?)?\d{10}$/, 'Phone number must be 10 digits with optional country code'),
});

export const orderItemInputSchema = z.object({
  productId: z.string().trim().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item'),
  shippingAddress: shippingAddressSchema,
});

export const orderIdParamsSchema = z.object({
  id: z.string().trim().min(1, 'Order ID is required'),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderIdParams = z.infer<typeof orderIdParamsSchema>;
