import { Router, Response, NextFunction } from 'express';
import { query } from '../db/client.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { notFound } from '../utils/errors.js';

const router = Router();

interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

function formatNotification(n: NotificationRow) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    relatedId: n.related_id,
    isRead: n.is_read,
    createdAt: n.created_at,
  };
}

// GET /api/notifications
router.get('/', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(50, parseInt((req.query.limit as string) ?? '20', 10));

    // Get accurate unread count from DB (independent of the page limit)
    const [{ count: unreadCount }] = await query<{ count: number }>`
      SELECT COUNT(*) AS count FROM notifications
      WHERE user_id = ${userId} AND is_read = FALSE
    `;

    const notifications = await query<NotificationRow>`
      SELECT * FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    res.json({
      success: true,
      data: notifications.map(formatNotification),
      meta: { unreadCount: Number(unreadCount) },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/read-all  — must be before /:id/read to avoid shadowing
router.put('/read-all', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await query`
      UPDATE notifications SET is_read = TRUE WHERE user_id = ${req.user!.id}
    `;
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await query`
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ${req.params.id} AND user_id = ${req.user!.id}
    `;
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [notif] = await query<{ id: string }>`
      SELECT id FROM notifications WHERE id = ${id} AND user_id = ${userId}
    `;
    if (!notif) return next(notFound('Notification'));

    await query`DELETE FROM notifications WHERE id = ${id}`;
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export default router;
