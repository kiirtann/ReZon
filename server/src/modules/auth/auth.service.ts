import { conflictError, unauthorizedError } from '../../lib/errors.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { prisma } from '../../lib/prisma.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
}

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
} as const;

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

export async function register(input: RegisterInput): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    throw conflictError('Email is already registered');
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: publicUserSelect,
  });
}

export async function login(input: LoginInput): Promise<PublicUser> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      ...publicUserSelect,
      passwordHash: true,
    },
  });

  // Always return the same error for unknown email and wrong password to prevent account enumeration.
  if (!user) {
    throw unauthorizedError(INVALID_CREDENTIALS_MESSAGE);
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) {
    throw unauthorizedError(INVALID_CREDENTIALS_MESSAGE);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw unauthorizedError();
  }

  return user;
}
