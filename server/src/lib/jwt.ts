import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtPayload {
  sub: string;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    typeof decoded.sub !== 'string' ||
    typeof decoded.email !== 'string'
  ) {
    throw new Error('Invalid token payload');
  }

  return { sub: decoded.sub, email: decoded.email };
}
