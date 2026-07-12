import { Router } from 'express';
import vehicleController from '../controllers/vehicleController';
import inventoryController from '../controllers/inventoryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * Vehicle CRUD routes — all require authentication.
 * Admin-only routes additionally require the 'admin' role.
 */

/** GET /api/vehicles/search — Search/filter vehicles (must be before /:id) */
router.get('/search', authenticate, vehicleController.search);

/** GET /api/vehicles — List all vehicles */
router.get('/', authenticate, vehicleController.getAll);

/** POST /api/vehicles — Add a new vehicle (Admin only) */
router.post('/', authenticate, authorize('admin'), vehicleController.create);

/** PUT /api/vehicles/:id — Update a vehicle (Admin only) */
router.put('/:id', authenticate, authorize('admin'), vehicleController.update);

/** DELETE /api/vehicles/:id — Delete a vehicle (Admin only) */
router.delete('/:id', authenticate, authorize('admin'), vehicleController.delete);

/** POST /api/vehicles/:id/purchase — Purchase a vehicle */
router.post('/:id/purchase', authenticate, inventoryController.purchase);

/** POST /api/vehicles/:id/restock — Restock a vehicle (Admin only) */
router.post('/:id/restock', authenticate, authorize('admin'), inventoryController.restock);

export default router;
