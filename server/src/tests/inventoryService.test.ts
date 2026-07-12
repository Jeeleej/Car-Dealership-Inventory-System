import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
process.env.NODE_ENV = 'test';

import sequelize from '../config/database';
import { Vehicle } from '../models';
import inventoryService from '../services/inventoryService';

/**
 * Unit Tests — Inventory Service
 * Tests purchase and restock operations including edge cases.
 */
describe('InventoryService', () => {
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

  describe('purchaseVehicle', () => {
    it('should decrease vehicle quantity on purchase', async () => {
      const vehicle = await Vehicle.create({
        make: 'Toyota', model: 'Camry', year: 2025,
        category: 'Sedan', price: 28000, quantity: 5,
      });

      const result = await inventoryService.purchaseVehicle(vehicle.id, 1);

      expect(result.message).toBe('Purchase successful');
      expect(result.vehicle.remainingQuantity).toBe(4);
    });

    it('should allow purchasing multiple units', async () => {
      const vehicle = await Vehicle.create({
        make: 'Honda', model: 'CR-V', year: 2025,
        category: 'SUV', price: 35000, quantity: 3,
      });

      const result = await inventoryService.purchaseVehicle(vehicle.id, 2);
      expect(result.vehicle.remainingQuantity).toBe(1);
    });

    it('should throw error when stock is insufficient', async () => {
      const vehicle = await Vehicle.create({
        make: 'Ford', model: 'Mustang', year: 2024,
        category: 'Sports', price: 45000, quantity: 1,
      });

      await expect(
        inventoryService.purchaseVehicle(vehicle.id, 2)
      ).rejects.toThrow('Insufficient stock');
    });

    it('should throw error when quantity is zero', async () => {
      const vehicle = await Vehicle.create({
        make: 'Tesla', model: 'Model 3', year: 2025,
        category: 'Electric', price: 42000, quantity: 0,
      });

      await expect(
        inventoryService.purchaseVehicle(vehicle.id, 1)
      ).rejects.toThrow('Insufficient stock');
    });

    it('should throw error for non-existent vehicle', async () => {
      await expect(
        inventoryService.purchaseVehicle(99999, 1)
      ).rejects.toThrow('Vehicle not found');
    });
  });

  describe('restockVehicle', () => {
    it('should increase vehicle quantity on restock', async () => {
      const vehicle = await Vehicle.create({
        make: 'BMW', model: 'X5', year: 2025,
        category: 'SUV', price: 65000, quantity: 2,
      });

      const result = await inventoryService.restockVehicle(vehicle.id, 5);

      expect(result.message).toBe('Restock successful');
      expect(result.vehicle.newQuantity).toBe(7);
    });

    it('should throw error for non-existent vehicle', async () => {
      await expect(
        inventoryService.restockVehicle(99999, 5)
      ).rejects.toThrow('Vehicle not found');
    });

    it('should throw error for zero quantity', async () => {
      const vehicle = await Vehicle.create({
        make: 'Audi', model: 'e-tron', year: 2025,
        category: 'Electric', price: 106000, quantity: 1,
      });

      await expect(
        inventoryService.restockVehicle(vehicle.id, 0)
      ).rejects.toThrow('Quantity must be a positive number');
    });

    it('should throw error for negative quantity', async () => {
      const vehicle = await Vehicle.create({
        make: 'Porsche', model: '911', year: 2025,
        category: 'Sports', price: 115000, quantity: 1,
      });

      await expect(
        inventoryService.restockVehicle(vehicle.id, -3)
      ).rejects.toThrow('Quantity must be a positive number');
    });
  });
});
