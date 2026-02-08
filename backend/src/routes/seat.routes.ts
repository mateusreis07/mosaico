import { Router } from 'express';
import { seatController } from '../controllers/seatController';

const router = Router();

// Public route to get seat info
router.get('/:seat_id', (req, res) => seatController.getSeat(req, res));

// Admin route to invalidate cache (Simulated)
router.post('/invalidate', (req, res) => seatController.invalidateSeat(req, res));

// Admin route to warmup cache
router.post('/admin/events/:eventId/warmup', (req, res) => seatController.warmupEvent(req, res));

export const seatRoutes = router;
