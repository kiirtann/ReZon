import { prisma } from '../lib/prisma.js';

/**
 * Clears all rows in dependency order so tests start from a clean database.
 */
export async function resetDb(): Promise<void> {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}
