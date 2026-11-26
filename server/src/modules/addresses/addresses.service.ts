import type { SavedAddress } from '@prisma/client';
import { forbiddenError, notFoundError } from '../../lib/errors.js';
import { prisma } from '../../lib/prisma.js';
import type { CreateAddressInput } from './addresses.schema.js';

export interface SavedAddressDto {
  id: string;
  label: string | null;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

function toDto(row: SavedAddress): SavedAddressDto {
  return {
    id: row.id,
    label: row.label,
    fullName: row.fullName,
    line1: row.line1,
    ...(row.line2 ? { line2: row.line2 } : {}),
    city: row.city,
    state: row.state,
    postalCode: row.postalCode,
    country: row.country,
    phone: row.phone,
    isDefault: row.isDefault,
  };
}

export async function listAddresses(userId: string): Promise<SavedAddressDto[]> {
  const rows = await prisma.savedAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  return rows.map(toDto);
}

export async function createAddress(
  userId: string,
  input: CreateAddressInput,
): Promise<SavedAddressDto> {
  const created = await prisma.$transaction(async (tx) => {
    const existingCount = await tx.savedAddress.count({ where: { userId } });
    // The user's first saved address is automatically marked default.
    const shouldBeDefault = input.isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await tx.savedAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.savedAddress.create({
      data: {
        userId,
        label: input.label || null,
        fullName: input.fullName,
        line1: input.line1,
        line2: input.line2 || null,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        phone: input.phone,
        isDefault: shouldBeDefault,
      },
    });
  });

  return toDto(created);
}

export async function setDefaultAddress(
  userId: string,
  addressId: string,
): Promise<SavedAddressDto> {
  const existing = await prisma.savedAddress.findUnique({ where: { id: addressId } });
  if (!existing) {
    throw notFoundError('Address not found');
  }
  if (existing.userId !== userId) {
    throw forbiddenError('You do not have access to this address');
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.savedAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return tx.savedAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  });

  return toDto(updated);
}

export async function deleteAddress(userId: string, addressId: string): Promise<void> {
  const existing = await prisma.savedAddress.findUnique({ where: { id: addressId } });
  if (!existing) {
    throw notFoundError('Address not found');
  }
  if (existing.userId !== userId) {
    throw forbiddenError('You do not have access to this address');
  }

  await prisma.savedAddress.delete({ where: { id: addressId } });
}
