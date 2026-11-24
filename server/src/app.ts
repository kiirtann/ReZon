import express from 'express';
import { healthRouter } from './modules/health/health.routes.js';

/**
 * Builds the Express app WITHOUT starting it.
 * server.ts calls listen(); tests import createApp() and use Supertest instead,
 * so tests never need a real port.
 */
export function createApp() {
  const app = express();

  // Parse JSON request bodies into req.body.
  // (Phase 7 mounts the Stripe webhook BEFORE this line, because it needs the raw body.)
  app.use(express.json());

  // All API routes live under /api/v1 (versioned, see docs/04-API_CONTRACT.md).
  const api = express.Router();
  api.use('/health', healthRouter);
  app.use('/api/v1', api);

  // T3.1 adds: helmet, cors, cookie-parser, request logging, notFound and errorHandler.
  return app;
}
