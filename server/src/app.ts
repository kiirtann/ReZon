import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestLogger } from './middleware/requestLogger.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { categoriesRouter } from './modules/categories/categories.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { productsRouter } from './modules/products/products.routes.js';

/**
 * Builds the Express app WITHOUT starting it.
 * server.ts calls listen(); tests import createApp() and use Supertest instead,
 * so tests never need a real port.
 */
export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(cookieParser());

  // Parse JSON request bodies into req.body.
  // (Phase 7 mounts the Stripe webhook BEFORE this line, because it needs the raw body.)
  app.use(express.json());
  app.use(requestLogger);

  // All API routes live under /api/v1 (versioned, see docs/04-API_CONTRACT.md).
  const api = express.Router();
  api.use('/health', healthRouter);
  api.use('/auth', authRouter);
  api.use('/categories', categoriesRouter);
  api.use('/products', productsRouter);
  app.use('/api/v1', api);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
