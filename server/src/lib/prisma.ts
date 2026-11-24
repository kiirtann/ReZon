import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

/**
 * PrismaClient singleton.
 * In development, `tsx watch` re-executes modules on file changes. Caching the instance
 * on `globalThis` prevents opening a new database connection on every hot reload.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
