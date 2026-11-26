import type { Request, Response } from 'express';
import { unauthorizedError } from '../../lib/errors.js';
import type { AddressIdParams, CreateAddressInput } from './addresses.schema.js';
import * as addressesService from './addresses.service.js';

export async function getAddresses(req: Request, res: Response): Promise<void> {
  if (!req.user) throw unauthorizedError();
  const addresses = await addressesService.listAddresses(req.user.id);
  res.status(200).json({ data: addresses });
}

export async function postAddress(req: Request, res: Response): Promise<void> {
  if (!req.user) throw unauthorizedError();
  const input = req.validated?.body as CreateAddressInput;
  const address = await addressesService.createAddress(req.user.id, input);
  res.status(201).json({ data: address });
}

export async function patchDefaultAddress(req: Request, res: Response): Promise<void> {
  if (!req.user) throw unauthorizedError();
  const { id } = req.validated?.params as AddressIdParams;
  const address = await addressesService.setDefaultAddress(req.user.id, id);
  res.status(200).json({ data: address });
}

export async function removeAddress(req: Request, res: Response): Promise<void> {
  if (!req.user) throw unauthorizedError();
  const { id } = req.validated?.params as AddressIdParams;
  await addressesService.deleteAddress(req.user.id, id);
  res.status(204).send();
}
