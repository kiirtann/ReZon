import { z } from 'zod';

export const COUNTRY_CODES = [
  { code: '+91', label: '+91 (India)' },
  { code: '+1', label: '+1 (US / Canada)' },
  { code: '+44', label: '+44 (UK)' },
  { code: '+61', label: '+61 (Australia)' },
  { code: '+49', label: '+49 (Germany)' },
  { code: '+971', label: '+971 (UAE)' },
  { code: '+65', label: '+65 (Singapore)' },
  { code: '+81', label: '+81 (Japan)' },
] as const;

export const shippingAddressSchema = z.object({
  label: z.string().trim().max(40, 'Label must be at most 40 characters').optional(),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  line1: z.string().trim().min(3, 'Address line 1 must be at least 3 characters'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City must be at least 2 characters'),
  state: z.string().trim().min(2, 'State must be at least 2 characters'),
  postalCode: z.string().trim().min(3, 'Postal code must be at least 3 characters'),
  country: z.string().trim().min(2, 'Country must be at least 2 characters'),
  countryCode: z
    .string()
    .trim()
    .regex(/^\+\d{1,4}$/, 'Select a valid country code'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  isDefault: z.boolean().optional(),
});

export type ShippingAddressFormValues = z.infer<typeof shippingAddressSchema>;
