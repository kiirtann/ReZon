import { Router } from 'express';

export const healthRouter = Router();

// GET /api/v1/health -> lets the client (and later, the hosting platform) check the API is up.
healthRouter.get('/', (_req, res) => {
  res.json({ data: { status: 'ok' } });
});
