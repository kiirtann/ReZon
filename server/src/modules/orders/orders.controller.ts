import type { Request, Response } from 'express';
import type { CreateOrderInput, OrderIdParams } from './orders.schema.js';
import { createOrder, getOrderById } from './orders.service.js';

export async function postCreateOrder(req: Request, res: Response): Promise<void> {
  const input = req.validated?.body as CreateOrderInput;
  const result = await createOrder(req.user!.id, input);
  res.status(201).json({ data: result });
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  const { id } = req.validated?.params as OrderIdParams;
  const order = await getOrderById(req.user!.id, id);
  res.json({ data: order });
}
