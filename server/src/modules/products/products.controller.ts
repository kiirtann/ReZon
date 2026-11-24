import type { Request, Response } from 'express';
import type { ListProductsQuery, ProductSlugParams } from './products.schema.js';
import { getProductBySlug, listProducts } from './products.service.js';

export async function getProducts(req: Request, res: Response): Promise<void> {
  const query = req.validated?.query as ListProductsQuery;
  const result = await listProducts(query);
  res.json(result);
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const { slug } = req.validated?.params as ProductSlugParams;
  const product = await getProductBySlug(slug);
  res.json({ data: product });
}
