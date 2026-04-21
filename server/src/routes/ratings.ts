import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/client.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/errors.js';
import { createNotification } from '../services/notifications.js';

const router = Router();

const createRatingSchema = z.object({
  caId: z.string().uuid('caId must be a valid UUID'),
  rating: z.number().int().min(1, 'rating must be at least 1').max(5, 'rating must be at most 5'),
  reviewText: z.string().optional(),
});

interface RatingRow {
  id: string;
  reviewer_id: string;
  ca_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  reviewer_name?: string;
  reviewer_image?: string | null;
}

// GET /api/ratings/stats/:caId  — must be before /:caId to avoid route shadowing
router.get('/stats/:caId', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caId } = req.params;

    const [stats] = await query<{ avg: number; count: number }>`
      SELECT AVG(rating) AS avg, COUNT(*) AS count FROM ratings WHERE ca_id = ${caId}
    `;

    const distribution = await query<{ rating: number; count: number }>`
      SELECT rating, COUNT(*) AS count FROM ratings WHERE ca_id = ${caId} GROUP BY rating ORDER BY rating
    `;

    res.json({
      success: true,
      data: {
        avg: stats.avg ? Number(Number(stats.avg).toFixed(1)) : null,
        count: Number(stats.count),
        distribution: distribution.map(d => ({ rating: d.rating, count: Number(d.count) })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/ratings
router.post('/', requireAuth, validateBody(createRatingSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caId, rating, reviewText } = req.body as z.infer<typeof createRatingSchema>;

    if (!caId || !rating) return next(badRequest('caId and rating are required'));

    const [ca] = await query<{ id: string; full_name: string }>`
      SELECT id, full_name FROM users WHERE id = ${caId} AND role = 'ca'
    `;
    if (!ca) return next(notFound('CA'));

    const completedAppt = await query<{ id: string }>`
      SELECT id FROM appointments
      WHERE client_id = ${req.user!.id} AND ca_id = ${caId} AND status = 'completed'
      LIMIT 1
    `;
    if (completedAppt.length === 0) {
      return next(forbidden('You can only review a CA after a completed appointment'));
    }

    const existing = await query<{ id: string }>`
      SELECT id FROM ratings WHERE reviewer_id = ${req.user!.id} AND ca_id = ${caId}
    `;
    if (existing.length > 0) {
      return next(conflict('You have already rated this CA'));
    }

    const [newRating] = await query<RatingRow>`
      INSERT INTO ratings (reviewer_id, ca_id, rating, review_text)
      VALUES (${req.user!.id}, ${caId}, ${rating}, ${reviewText ?? null})
      RETURNING *
    `;

    const [reviewer] = await query<{ full_name: string }>`
      SELECT full_name FROM users WHERE id = ${req.user!.id}
    `;

    await createNotification(
      caId,
      'rating',
      'New review received',
      `${reviewer.full_name} gave you ${rating} star${rating !== 1 ? 's' : ''}`,
      newRating.id
    );

    res.status(201).json({ success: true, data: newRating });
  } catch (err) {
    next(err);
  }
});

// GET /api/ratings/:caId
router.get('/:caId', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caId } = req.params;
    const limit = Math.min(50, parseInt((req.query.limit as string) ?? '20', 10));
    const offset = Math.max(0, parseInt((req.query.offset as string) ?? '0', 10));

    const ratings = await query<RatingRow>`
      SELECT r.*, u.full_name AS reviewer_name, u.profile_image AS reviewer_image
      FROM ratings r
      JOIN users u ON u.id = r.reviewer_id
      WHERE r.ca_id = ${caId}
      ORDER BY r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const formatted = ratings.map(r => ({
      id: r.id,
      reviewerId: r.reviewer_id,
      caId: r.ca_id,
      rating: r.rating,
      reviewText: r.review_text,
      createdAt: r.created_at,
      reviewerName: r.reviewer_name,
      reviewerImage: r.reviewer_image,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
});

export default router;
