import type { CookieOptions, Request, Response } from 'express';
import { env } from '../../config/env.js';
import { unauthorizedError } from '../../lib/errors.js';
import { signToken } from '../../lib/jwt.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';
import * as authService from './auth.service.js';

const AUTH_COOKIE_NAME = 'token';

function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  };
}

function setAuthCookie(res: Response, user: authService.PublicUser): void {
  const token = signToken({ sub: user.id, email: user.email });
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
}

export async function register(req: Request, res: Response): Promise<void> {
  const input = req.validated?.body as RegisterInput;
  const user = await authService.register(input);
  setAuthCookie(res, user);
  res.status(201).json({ data: user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = req.validated?.body as LoginInput;
  const user = await authService.login(input);
  setAuthCookie(res, user);
  res.status(200).json({ data: user });
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
  res.status(204).send();
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw unauthorizedError();
  }

  const user = await authService.getMe(req.user.id);
  res.status(200).json({ data: user });
}
