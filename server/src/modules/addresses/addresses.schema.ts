import { z } from 'zod';
import { shippingAddressSchema } from '../orders/orders.schema.js';

export const createAddressSchema = shippingAddressSchema.extend({
  label: z.string().trim().max(40).optional(),
  isDefault: z.boolean().optional().default(false),
});

export const addressIdParamsSchema = z.object({
  id: z.string().trim().min(1, 'Address ID is required'),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type AddressIdParams = z.infer<typeof addressIdParamsSchema>;
