import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
} from '../controllers/userController.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware, adminOnly);

// list (keeps previous behaviour returning role = 'user' by default)
router.get('/', getUsers);

// create
router.post('/', createUser);

// update
router.put('/:id', updateUser);

// "delete" -> deactivate
router.delete('/:id', deleteUser);

// activate (admin only)
router.patch('/:id/activate', activateUser);

export default router;
