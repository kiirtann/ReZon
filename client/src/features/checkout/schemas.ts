import { z } from 'zod';

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  line1: z.string().trim().min(3, 'Address line 1 must be at least 3 characters'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City must be at least 2 characters'),
  state: z.string().trim().min(2, 'State must be at least 2 characters'),
  postalCode: z.string().trim().min(3, 'Postal code must be at least 3 characters'),
  country: z.string().trim().min(2, 'Country must be at least 2 characters'),
  phone: z.string().trim().min(7, 'Phone number must be at least 7 characters'),
});

export type ShippingAddressFormValues = z.infer<typeof shippingAddressSchema>;
