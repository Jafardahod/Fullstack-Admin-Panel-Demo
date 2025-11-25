// backend/src/routes/itemRoutes.js
import express from 'express';
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} from '../controllers/itemController.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// anyone logged-in can view items
router.get('/', authMiddleware, getItems);

// only admin can modify
router.post('/', authMiddleware, adminOnly, createItem);
router.put('/:id', authMiddleware, adminOnly, updateItem);
router.delete('/:id', authMiddleware, adminOnly, deleteItem);

export default router;
