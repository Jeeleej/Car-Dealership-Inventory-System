import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
process.env.NODE_ENV = 'test';

import sequelize from '../config/database';
import { User } from '../models';
import authService from '../services/authService';

/**
 * Unit Tests — Auth Service
 * Tests registration, login, duplicate detection, and error handling.
 */
describe('AuthService', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.username).toBe('testuser');
      expect(result.user.role).toBe('user');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw an error for duplicate email', async () => {
      await authService.register({
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123',
      });

      await expect(
        authService.register({
          username: 'user2',
          email: 'duplicate@example.com',
          password: 'password456',
        })
      ).rejects.toThrow('Email already registered');
    });

    it('should throw an error for duplicate username', async () => {
      await authService.register({
        username: 'sameuser',
        email: 'first@example.com',
        password: 'password123',
      });

      await expect(
        authService.register({
          username: 'sameuser',
          email: 'second@example.com',
          password: 'password456',
        })
      ).rejects.toThrow('Username already taken');
    });

    it('should hash the password before storing', async () => {
      await authService.register({
        username: 'hashtest',
        email: 'hash@example.com',
        password: 'plaintext123',
      });

      const user = await User.findOne({ where: { email: 'hash@example.com' } });
      expect(user).not.toBeNull();
      expect(user!.password).not.toBe('plaintext123');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login with valid credentials', async () => {
      const result = await authService.login({
        email: 'login@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('login@example.com');
    });

    it('should throw error for invalid email', async () => {
      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for invalid password', async () => {
      await expect(
        authService.login({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
