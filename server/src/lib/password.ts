import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

// Lower cost factor in tests keeps the test suite fast while production uses 10 rounds.
const BCRYPT_ROUNDS = env.NODE_ENV === 'test' ? 4 : 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
