import express from 'express';
import { createUser, getUsers, getUserById } from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createUser);
router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);

export default router;
