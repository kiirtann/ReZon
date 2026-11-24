import { Router } from 'express';
import { getCategories } from './categories.controller.js';

export const categoriesRouter = Router();

// GET /api/v1/categories -> list all categories ordered by name
categoriesRouter.get('/', getCategories);
