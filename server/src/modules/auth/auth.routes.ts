import { Router } from 'express';
import { createRateLimiter } from '../../middleware/rateLimit.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { changePassword, login, logout, me, register, updateProfile } from './auth.controller.js';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from './auth.schema.js';

export const authRouter = Router();

// Limit brute-force attempts on credential endpoints (20 requests per 15 minutes per IP).
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipInTest: true,
});

authRouter.post('/register', authRateLimiter, validate({ body: registerSchema }), register);
authRouter.post('/login', authRateLimiter, validate({ body: loginSchema }), login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);
authRouter.patch('/me', requireAuth, validate({ body: updateProfileSchema }), updateProfile);
authRouter.patch(
  '/password',
  requireAuth,
  validate({ body: changePasswordSchema }),
  changePassword,
);
