import jwt from 'jsonwebtoken';
import { User } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'car_dealership_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/** Payload embedded in JWT tokens */
interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

/**
 * Generates a signed JWT token for the given user.
 */
function generateToken(user: { id: number; email: string; role: string }): string {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * AuthService — handles user registration and login logic.
 */
const authService = {
  /**
   * Registers a new user account.
   * @throws Error if the email or username is already taken
   */
  async register(data: { username: string; email: string; password: string }) {
    // Check for existing user by email
    const existingEmail = await User.findOne({ where: { email: data.email } });
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Check for existing user by username
    const existingUsername = await User.findOne({ where: { username: data.username } });
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Create the user (password is hashed via model hook)
    const user = await User.create({
      username: data.username,
      email: data.email,
      password: data.password,
    });

    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  /**
   * Authenticates a user with email and password.
   * @throws Error if credentials are invalid
   */
  async login(data: { email: string; password: string }) {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },
};

export default authService;
