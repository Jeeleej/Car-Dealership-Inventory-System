import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
process.env.NODE_ENV = 'test';

import request from 'supertest';
import sequelize from '../config/database';
import { User, Vehicle } from '../models';
import app from '../app';

/**
 * Integration Tests — API Endpoints
 * Tests the full request → response cycle through Express.
 */
describe('API Integration Tests', () => {
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // ─── Auth Endpoints ────────────────────────────────────────
  describe('Auth Endpoints', () => {
    beforeEach(async () => {
      await User.destroy({ where: {} });
    });

    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({ username: 'newuser', email: 'new@example.com', password: 'password123' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toBe('new@example.com');
      });

      it('should return 400 for invalid email', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({ username: 'newuser', email: 'invalid-email', password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
      });

      it('should return 400 for short password', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({ username: 'newuser', email: 'test@example.com', password: '123' });

        expect(res.status).toBe(400);
      });
    });

    describe('POST /api/auth/login', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/auth/register')
          .send({ username: 'loginuser', email: 'login@example.com', password: 'password123' });
      });

      it('should login with valid credentials', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: 'login@example.com', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
      });

      it('should return 401 for wrong password', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: 'login@example.com', password: 'wrongpassword' });

        expect(res.status).toBe(401);
      });
    });
  });

  // ─── Vehicle Endpoints ─────────────────────────────────────
  describe('Vehicle Endpoints', () => {
    beforeAll(async () => {
      // Clean and recreate users
      await User.destroy({ where: {} });
      await Vehicle.destroy({ where: {} });

      // Register a regular user
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'user@example.com', password: 'password123' });
      userToken = userRes.body.token;

      // Create an admin user directly in DB
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      await User.create({ username: 'admin', email: 'admin@test.com', password: hash, role: 'admin' }, { hooks: false });

      // Login as admin
      const adminRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'admin123' });
      adminToken = adminRes.body.token;
    });

    describe('POST /api/vehicles', () => {
      it('should allow admin to create a vehicle', async () => {
        const res = await request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ make: 'Toyota', model: 'Camry', year: 2025, category: 'Sedan', price: 28000, quantity: 5 });

        expect(res.status).toBe(201);
        expect(res.body.make).toBe('Toyota');
      });

      it('should deny regular user from creating a vehicle', async () => {
        const res = await request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ make: 'Toyota', model: 'Camry', year: 2025, category: 'Sedan', price: 28000, quantity: 5 });

        expect(res.status).toBe(403);
      });

      it('should return 401 without auth token', async () => {
        const res = await request(app)
          .post('/api/vehicles')
          .send({ make: 'Toyota', model: 'Camry', year: 2025, category: 'Sedan', price: 28000, quantity: 5 });

        expect(res.status).toBe(401);
      });
    });

    describe('GET /api/vehicles', () => {
      it('should return all vehicles', async () => {
        const res = await request(app)
          .get('/api/vehicles')
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      });
    });

    describe('GET /api/vehicles/search', () => {
      it('should search vehicles by make', async () => {
        const res = await request(app)
          .get('/api/vehicles/search?make=Toyota')
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      });
    });

    describe('PUT /api/vehicles/:id', () => {
      it('should allow admin to update a vehicle', async () => {
        // First create a vehicle
        const createRes = await request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ make: 'Honda', model: 'Civic', year: 2025, category: 'Sedan', price: 25000, quantity: 3 });

        const res = await request(app)
          .put(`/api/vehicles/${createRes.body.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ price: 27000 });

        expect(res.status).toBe(200);
        expect(Number(res.body.price)).toBe(27000);
      });
    });

    describe('DELETE /api/vehicles/:id', () => {
      it('should allow admin to delete a vehicle', async () => {
        const createRes = await request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ make: 'Ford', model: 'Focus', year: 2024, category: 'Sedan', price: 22000, quantity: 1 });

        const res = await request(app)
          .delete(`/api/vehicles/${createRes.body.id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
      });

      it('should deny regular user from deleting', async () => {
        const createRes = await request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ make: 'Chevy', model: 'Cruze', year: 2024, category: 'Sedan', price: 20000, quantity: 1 });

        const res = await request(app)
          .delete(`/api/vehicles/${createRes.body.id}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(403);
      });
    });

    // ─── Inventory Endpoints ───────────────────────────────────
    describe('POST /api/vehicles/:id/purchase', () => {
      it('should allow user to purchase a vehicle', async () => {
        const createRes = await request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ make: 'Tesla', model: 'Model 3', year: 2025, category: 'Electric', price: 42000, quantity: 3 });

        const res = await request(app)
          .post(`/api/vehicles/${createRes.body.id}/purchase`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ quantity: 1 });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Purchase successful');
        expect(res.body.vehicle.remainingQuantity).toBe(2);
      });
    });

    describe('POST /api/vehicles/:id/restock', () => {
      it('should allow admin to restock a vehicle', async () => {
        const createRes = await request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ make: 'BMW', model: 'X5', year: 2025, category: 'SUV', price: 65000, quantity: 2 });

        const res = await request(app)
          .post(`/api/vehicles/${createRes.body.id}/restock`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ quantity: 5 });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Restock successful');
        expect(res.body.vehicle.newQuantity).toBe(7);
      });

      it('should deny regular user from restocking', async () => {
        const createRes = await request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ make: 'Audi', model: 'A4', year: 2025, category: 'Sedan', price: 45000, quantity: 2 });

        const res = await request(app)
          .post(`/api/vehicles/${createRes.body.id}/restock`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ quantity: 5 });

        expect(res.status).toBe(403);
      });
    });
  });
});
