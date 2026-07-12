import { Request, Response } from 'express';
import { z } from 'zod';
import authService from '../services/authService';

/** Validation schema for user registration */
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/** Validation schema for user login */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * AuthController — handles HTTP requests for user authentication.
 */
const authController = {
  /**
   * POST /api/auth/register
   * Registers a new user and returns a JWT token.
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);
      res.status(201).json(result);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      const message = error instanceof Error ? error.message : 'Registration failed';
      const status = message.includes('already') ? 409 : 500;
      res.status(status).json({ message });
    }
  },

  /**
   * POST /api/auth/login
   * Authenticates a user and returns a JWT token.
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);
      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      const message = error instanceof Error ? error.message : 'Login failed';
      const status = message.includes('Invalid') ? 401 : 500;
      res.status(status).json({ message });
    }
  },
};

export default authController;
