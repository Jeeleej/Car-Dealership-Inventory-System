import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
process.env.NODE_ENV = 'test';

import sequelize from '../config/database';
import { Vehicle } from '../models';
import vehicleService from '../services/vehicleService';

/**
 * Unit Tests — Vehicle Service
 * Tests CRUD operations and search functionality.
 */
describe('VehicleService', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Vehicle.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  const sampleVehicle = {
    make: 'Toyota',
    model: 'Camry',
    year: 2025,
    category: 'Sedan',
    price: 28000,
    quantity: 5,
  };

  describe('createVehicle', () => {
    it('should create a vehicle successfully', async () => {
      const vehicle = await vehicleService.createVehicle(sampleVehicle);

      expect(vehicle).toHaveProperty('id');
      expect(vehicle.make).toBe('Toyota');
      expect(vehicle.model).toBe('Camry');
      expect(vehicle.year).toBe(2025);
      expect(vehicle.category).toBe('Sedan');
      expect(Number(vehicle.price)).toBe(28000);
      expect(vehicle.quantity).toBe(5);
    });
  });

  describe('getAllVehicles', () => {
    it('should return an empty array when no vehicles exist', async () => {
      const vehicles = await vehicleService.getAllVehicles();
      expect(vehicles).toEqual([]);
    });

    it('should return all vehicles', async () => {
      await vehicleService.createVehicle(sampleVehicle);
      await vehicleService.createVehicle({ ...sampleVehicle, make: 'Honda', model: 'Civic' });

      const vehicles = await vehicleService.getAllVehicles();
      expect(vehicles).toHaveLength(2);
    });
  });

  describe('getVehicleById', () => {
    it('should return a vehicle by ID', async () => {
      const created = await vehicleService.createVehicle(sampleVehicle);
      const found = await vehicleService.getVehicleById(created.id);

      expect(found.id).toBe(created.id);
      expect(found.make).toBe('Toyota');
    });

    it('should throw error for non-existent ID', async () => {
      await expect(vehicleService.getVehicleById(99999)).rejects.toThrow('Vehicle not found');
    });
  });

  describe('searchVehicles', () => {
    beforeEach(async () => {
      await vehicleService.createVehicle({ make: 'Toyota', model: 'Camry', year: 2025, category: 'Sedan', price: 28000, quantity: 5 });
      await vehicleService.createVehicle({ make: 'Honda', model: 'CR-V', year: 2025, category: 'SUV', price: 35000, quantity: 3 });
      await vehicleService.createVehicle({ make: 'Ford', model: 'Mustang', year: 2024, category: 'Sports', price: 45000, quantity: 2 });
    });

    it('should search by make', async () => {
      const results = await vehicleService.searchVehicles({ make: 'Toyota' });
      expect(results).toHaveLength(1);
      expect(results[0].make).toBe('Toyota');
    });

    it('should search by category', async () => {
      const results = await vehicleService.searchVehicles({ category: 'SUV' });
      expect(results).toHaveLength(1);
      expect(results[0].model).toBe('CR-V');
    });

    it('should search by price range', async () => {
      const results = await vehicleService.searchVehicles({ minPrice: 30000, maxPrice: 40000 });
      expect(results).toHaveLength(1);
      expect(results[0].model).toBe('CR-V');
    });

    it('should return all vehicles when no filters are provided', async () => {
      const results = await vehicleService.searchVehicles({});
      expect(results).toHaveLength(3);
    });
  });

  describe('updateVehicle', () => {
    it('should update a vehicle successfully', async () => {
      const created = await vehicleService.createVehicle(sampleVehicle);
      const updated = await vehicleService.updateVehicle(created.id, { price: 30000 });

      expect(Number(updated.price)).toBe(30000);
    });

    it('should throw error for non-existent vehicle', async () => {
      await expect(vehicleService.updateVehicle(99999, { price: 30000 })).rejects.toThrow('Vehicle not found');
    });
  });

  describe('deleteVehicle', () => {
    it('should delete a vehicle successfully', async () => {
      const created = await vehicleService.createVehicle(sampleVehicle);
      const result = await vehicleService.deleteVehicle(created.id);

      expect(result.message).toBe('Vehicle deleted successfully');

      const vehicles = await vehicleService.getAllVehicles();
      expect(vehicles).toHaveLength(0);
    });

    it('should throw error for non-existent vehicle', async () => {
      await expect(vehicleService.deleteVehicle(99999)).rejects.toThrow('Vehicle not found');
    });
  });
});
