import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authUser.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateUser, getCurrentUser);

export default router;
