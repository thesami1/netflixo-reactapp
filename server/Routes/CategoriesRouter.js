import express from 'express';

import { admin, protect } from '../middlewares/Auth.js';
import * as categoryController from '../Controllers/CategoriesController.js';

const router = express.Router();

// ********* PUBLIC ROUTES *********
router.get('/', categoryController.getCategories);


// ********* ADMIN ROUTES *********
router.post('/', protect, admin, categoryController.createCategory);
router.put('/:id', protect, admin, categoryController.updateCategory);
router.delete('/:id', protect, admin, categoryController.deleteCategory);


export default router;