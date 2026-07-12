import { Request, Response } from 'express';
import { z } from 'zod';
import vehicleService from '../services/vehicleService';

/** Validation schema for creating/updating a vehicle */
const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  description: z.string().optional().default(''),
  imageUrl: z.string().optional().default(''),
});

/** Partial schema for vehicle updates (all fields optional) */
const vehicleUpdateSchema = vehicleSchema.partial();

/**
 * VehicleController — handles HTTP requests for vehicle CRUD operations.
 */
const vehicleController = {
  /**
   * POST /api/vehicles
   * Creates a new vehicle listing.
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = vehicleSchema.parse(req.body);
      const vehicle = await vehicleService.createVehicle(validated);
      res.status(201).json(vehicle);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      const message = error instanceof Error ? error.message : 'Failed to create vehicle';
      res.status(500).json({ message });
    }
  },

  /**
   * GET /api/vehicles
   * Returns a list of all vehicles.
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const vehicles = await vehicleService.getAllVehicles();
      res.status(200).json(vehicles);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch vehicles';
      res.status(500).json({ message });
    }
  },

  /**
   * GET /api/vehicles/search?make=&model=&category=&minPrice=&maxPrice=
   * Searches vehicles by filters.
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        make: req.query.make as string | undefined,
        model: req.query.model as string | undefined,
        category: req.query.category as string | undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      };
      const vehicles = await vehicleService.searchVehicles(filters);
      res.status(200).json(vehicles);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Search failed';
      res.status(500).json({ message });
    }
  },

  /**
   * PUT /api/vehicles/:id
   * Updates a vehicle's details.
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const validated = vehicleUpdateSchema.parse(req.body);
      const vehicle = await vehicleService.updateVehicle(id, validated);
      res.status(200).json(vehicle);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      const message = error instanceof Error ? error.message : 'Failed to update vehicle';
      const status = message.includes('not found') ? 404 : 500;
      res.status(status).json({ message });
    }
  },

  /**
   * DELETE /api/vehicles/:id
   * Deletes a vehicle (admin only — enforced at route level).
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const result = await vehicleService.deleteVehicle(id);
      res.status(200).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete vehicle';
      const status = message.includes('not found') ? 404 : 500;
      res.status(status).json({ message });
    }
  },
};

export default vehicleController;
