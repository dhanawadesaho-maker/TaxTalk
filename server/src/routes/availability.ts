import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/client.js';
import { requireAuth, requireCA, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { badRequest } from '../utils/errors.js';

const updateAvailabilitySchema = z.object({
  slots: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0, 'dayOfWeek must be 0–6').max(6, 'dayOfWeek must be 0–6'),
      startTime: z.string().min(1, 'startTime is required'),
      endTime: z.string().min(1, 'endTime is required'),
    })
  ),
});

const router = Router();

interface SlotRow {
  id: number;
  ca_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

// GET /api/availability/:caId
router.get('/:caId', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caId } = req.params;
    const slots = await query<SlotRow>`
      SELECT * FROM availability_slots WHERE ca_id = ${caId} AND is_active = TRUE ORDER BY day_of_week, start_time
    `;
    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
});

// PUT /api/availability/:caId  (replace entire schedule)
router.put('/:caId', requireAuth, requireCA, validateBody(updateAvailabilitySchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caId } = req.params;
    if (req.user!.id !== caId) {
      return next(badRequest('You can only update your own availability'));
    }

    const { slots } = req.body as z.infer<typeof updateAvailabilitySchema>;

    // Replace all slots for this CA
    await query`DELETE FROM availability_slots WHERE ca_id = ${caId}`;

    for (const s of slots) {
      await query`
        INSERT INTO availability_slots (ca_id, day_of_week, start_time, end_time)
        VALUES (${caId}, ${s.dayOfWeek}, ${s.startTime}, ${s.endTime})
      `;
    }

    const updated = await query<SlotRow>`
      SELECT * FROM availability_slots WHERE ca_id = ${caId} ORDER BY day_of_week, start_time
    `;

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
