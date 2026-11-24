import { prisma } from '../../lib/prisma.js';

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
}

/**
 * Returns all categories sorted alphabetically by name.
 */
export async function listCategories(): Promise<CategoryDto[]> {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}
