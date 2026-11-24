import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { login, logout, me, register } from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), register);
authRouter.post('/login', validate({ body: loginSchema }), login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);
