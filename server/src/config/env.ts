import 'dotenv/config'; // loads server/.env into process.env
import { z } from 'zod';

const DEV_DEFAULT_JWT_SECRET = 'dev-only-insecure-secret-change-in-prod-32chars';

/**
 * Validate environment variables once, at startup ("fail fast").
 * If something is missing or malformed, the server refuses to start with a clear message,
 * instead of crashing later in some random request.
 * New variables are added here as each phase needs them (see .env.example).
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    CLIENT_URL: z.string().url().default('http://localhost:5173'),
    DATABASE_URL: z.string().min(1).default('file:./dev.db'),
    JWT_SECRET: z.string().min(32).default(DEV_DEFAULT_JWT_SECRET),
    JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production' && data.JWT_SECRET === DEV_DEFAULT_JWT_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET must be set to a strong secret in production',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
