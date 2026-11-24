import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { getProduct, getProducts } from './products.controller.js';
import { listProductsQuerySchema, productSlugParamsSchema } from './products.schema.js';

export const productsRouter = Router();

// GET /api/v1/products -> filtered, sorted, paginated active products
productsRouter.get('/', validate({ query: listProductsQuerySchema }), getProducts);

// GET /api/v1/products/:slug -> single active product detail
productsRouter.get('/:slug', validate({ params: productSlugParamsSchema }), getProduct);
