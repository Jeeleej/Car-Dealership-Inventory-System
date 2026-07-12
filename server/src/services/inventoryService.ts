import { Vehicle } from '../models';

/**
 * InventoryService — handles stock management (purchase and restock operations).
 */
const inventoryService = {
  /**
   * Purchases a vehicle, decreasing its stock quantity.
   * @param vehicleId - The ID of the vehicle to purchase
   * @param quantity - The number of units to purchase (defaults to 1)
   * @throws Error if vehicle is not found or insufficient stock
   */
  async purchaseVehicle(vehicleId: number, quantity: number = 1) {
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    if (vehicle.quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    vehicle.quantity -= quantity;
    await vehicle.save();

    return {
      message: 'Purchase successful',
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        remainingQuantity: vehicle.quantity,
      },
    };
  },

  /**
   * Restocks a vehicle, increasing its stock quantity.
   * Admin-only operation (enforced at route level).
   * @param vehicleId - The ID of the vehicle to restock
   * @param quantity - The number of units to add to stock
   * @throws Error if vehicle is not found or quantity is invalid
   */
  async restockVehicle(vehicleId: number, quantity: number) {
    if (quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }

    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    vehicle.quantity += quantity;
    await vehicle.save();

    return {
      message: 'Restock successful',
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        newQuantity: vehicle.quantity,
      },
    };
  },
};

export default inventoryService;
