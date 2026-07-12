import { Op } from 'sequelize';
import { Vehicle } from '../models';
import { VehicleCreationAttributes } from '../models/Vehicle';

/** Search filter parameters for vehicle queries */
interface VehicleSearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * VehicleService — handles all vehicle CRUD and search operations.
 */
const vehicleService = {
  /**
   * Creates a new vehicle listing in the inventory.
   */
  async createVehicle(data: VehicleCreationAttributes) {
    const vehicle = await Vehicle.create(data);
    return vehicle;
  },

  /**
   * Returns all vehicles in the inventory.
   */
  async getAllVehicles() {
    const vehicles = await Vehicle.findAll({
      order: [['createdAt', 'DESC']],
    });
    return vehicles;
  },

  /**
   * Retrieves a single vehicle by ID.
   * @throws Error if vehicle is not found
   */
  async getVehicleById(id: number) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    return vehicle;
  },

  /**
   * Searches vehicles using flexible filters.
   * Supports partial matching on make/model and price range filtering.
   */
  async searchVehicles(filters: VehicleSearchFilters) {
    const where: Record<string, unknown> = {};

    if (filters.make) {
      where.make = { [Op.like]: `%${filters.make}%` };
    }
    if (filters.model) {
      where.model = { [Op.like]: `%${filters.model}%` };
    }
    if (filters.category) {
      where.category = { [Op.like]: `%${filters.category}%` };
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        (where.price as Record<symbol, number>)[Op.gte] = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        (where.price as Record<symbol, number>)[Op.lte] = filters.maxPrice;
      }
    }

    const vehicles = await Vehicle.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    return vehicles;
  },

  /**
   * Updates a vehicle's details.
   * @throws Error if vehicle is not found
   */
  async updateVehicle(id: number, data: Partial<VehicleCreationAttributes>) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    await vehicle.update(data);
    return vehicle;
  },

  /**
   * Deletes a vehicle from the inventory.
   * @throws Error if vehicle is not found
   */
  async deleteVehicle(id: number) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    await vehicle.destroy();
    return { message: 'Vehicle deleted successfully' };
  },
};

export default vehicleService;
