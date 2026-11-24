import type { NextFunction, Request, Response } from 'express';
import { unauthorizedError } from '../lib/errors.js';
import { verifyToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Verifies the httpOnly `token` cookie, loads the user from the DB, and attaches `req.user`.
 * Rejects with 401 UNAUTHENTICATED if the cookie is missing, invalid, expired, or the user no longer exists.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.token as string | undefined;
    if (!token) {
      throw unauthorizedError();
    }

    let payload: { sub: string; email: string };
    try {
      payload = verifyToken(token);
    } catch {
      throw unauthorizedError('Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw unauthorizedError('Invalid or expired token');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
