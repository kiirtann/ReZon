import { z } from 'zod';

// Treat empty query strings (e.g. ?minPrice=&search=) as omitted so optional filters
// don't coerce "" into 0.
const emptyToUndefined = (val: unknown): unknown => (val === '' ? undefined : val);

const optionalNonNegativeInt = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().min(0).optional(),
);

const optionalTrimmedString = z.preprocess((val) => {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().optional());

export const listProductsQuerySchema = z.object({
  search: optionalTrimmedString,
  category: optionalTrimmedString,
  minPrice: optionalNonNegativeInt,
  maxPrice: optionalNonNegativeInt,
  sort: z.preprocess(
    emptyToUndefined,
    z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).default('newest'),
  ),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(48).default(12)),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

export const productSlugParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

export type ProductSlugParams = z.infer<typeof productSlugParamsSchema>;
