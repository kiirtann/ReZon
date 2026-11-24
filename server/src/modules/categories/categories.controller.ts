import type { Request, Response } from 'express';
import { listCategories } from './categories.service.js';

export async function getCategories(_req: Request, res: Response): Promise<void> {
  const categories = await listCategories();
  res.json({ data: categories });
}
