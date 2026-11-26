import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import {
  getAddresses,
  patchDefaultAddress,
  postAddress,
  removeAddress,
} from './addresses.controller.js';
import { addressIdParamsSchema, createAddressSchema } from './addresses.schema.js';

export const addressesRouter = Router();

addressesRouter.use(requireAuth);

addressesRouter.get('/', getAddresses);
addressesRouter.post('/', validate({ body: createAddressSchema }), postAddress);
addressesRouter.patch(
  '/:id/default',
  validate({ params: addressIdParamsSchema }),
  patchDefaultAddress,
);
addressesRouter.delete('/:id', validate({ params: addressIdParamsSchema }), removeAddress);
