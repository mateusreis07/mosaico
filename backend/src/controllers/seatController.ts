import { Request, Response } from 'express';
import { seatService } from '../services/seatService';

export class SeatController {

  public async getSeat(req: Request, res: Response): Promise<void> {
    try {
      const { seat_id } = req.params;

      if (!seat_id) {
        res.status(400).json({ error: 'seat_id is required' });
        return;
      }

      const data = await seatService.getSeatColor(seat_id);
      res.json(data);

    } catch (error) {
      console.error('Error fetching seat:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  public async invalidateSeat(req: Request, res: Response): Promise<void> {
    try {
      const { seat_id } = req.body;

      if (!seat_id) {
        res.status(400).json({ error: 'seat_id is required in body' });
        return;
      }

      seatService.invalidateSeat(seat_id);
      res.json({ message: `Cache invalidated for seat ${seat_id}` });

    } catch (error) {
      console.error('Error invalidating cache:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const seatController = new SeatController();
