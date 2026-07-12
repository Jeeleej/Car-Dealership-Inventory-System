import { Router } from 'express';
import authController from '../controllers/authController';

const router = Router();

/** POST /api/auth/register — Register a new user */
router.post('/register', authController.register);

/** POST /api/auth/login — Login and receive JWT */
router.post('/login', authController.login);

export default router;
