import { Request, Response } from 'express';
import { z } from 'zod';
import inventoryService from '../services/inventoryService';

/** Validation schema for purchase requests */
const purchaseSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional().default(1),
});

/** Validation schema for restock requests */
const restockSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

/**
 * InventoryController — handles HTTP requests for purchase and restock operations.
 */
const inventoryController = {
  /**
   * POST /api/vehicles/:id/purchase
   * Purchases a vehicle, decreasing its stock.
   */
  async purchase(req: Request, res: Response): Promise<void> {
    try {
      const vehicleId = Number(req.params.id);
      const { quantity } = purchaseSchema.parse(req.body);
      const result = await inventoryService.purchaseVehicle(vehicleId, quantity);
      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      const message = error instanceof Error ? error.message : 'Purchase failed';
      if (message.includes('not found')) {
        res.status(404).json({ message });
      } else if (message.includes('Insufficient')) {
        res.status(400).json({ message });
      } else {
        res.status(500).json({ message });
      }
    }
  },

  /**
   * POST /api/vehicles/:id/restock
   * Restocks a vehicle, increasing its stock (admin only).
   */
  async restock(req: Request, res: Response): Promise<void> {
    try {
      const vehicleId = Number(req.params.id);
      const { quantity } = restockSchema.parse(req.body);
      const result = await inventoryService.restockVehicle(vehicleId, quantity);
      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      const message = error instanceof Error ? error.message : 'Restock failed';
      const status = message.includes('not found') ? 404 : 400;
      res.status(status).json({ message });
    }
  },
};

export default inventoryController;
