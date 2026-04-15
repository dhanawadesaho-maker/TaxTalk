import { Router, Response, NextFunction } from 'express';
import { query } from '../db/client.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { forbidden, notFound } from '../utils/errors.js';

const router = Router();

interface ChatRow {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string | null;
  other_id: string;
  other_name: string;
  other_image: string | null;
  other_role: string;
  unread_count: number;
  last_content: string | null;
}

// GET /api/chats
router.get('/', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const chats = await query<ChatRow>`
      SELECT
        c.id, c.user1_id, c.user2_id, c.last_message_at,
        CASE WHEN c.user1_id = ${userId} THEN c.user2_id ELSE c.user1_id END AS other_id,
        u.full_name AS other_name,
        u.profile_image AS other_image,
        u.role AS other_role,
        COUNT(m.id) FILTER (WHERE m.is_read = FALSE AND m.receiver_id = ${userId}) AS unread_count,
        (
          SELECT content FROM messages
          WHERE (
            sender_id = ${userId}
            AND receiver_id = CASE WHEN c.user1_id = ${userId} THEN c.user2_id ELSE c.user1_id END
          ) OR (
            sender_id = CASE WHEN c.user1_id = ${userId} THEN c.user2_id ELSE c.user1_id END
            AND receiver_id = ${userId}
          )
          ORDER BY created_at DESC LIMIT 1
        ) AS last_content
      FROM chats c
      JOIN users u ON u.id = CASE WHEN c.user1_id = ${userId} THEN c.user2_id ELSE c.user1_id END
      LEFT JOIN messages m ON (
        (m.sender_id = c.user1_id AND m.receiver_id = c.user2_id)
        OR (m.sender_id = c.user2_id AND m.receiver_id = c.user1_id)
      )
      WHERE c.user1_id = ${userId} OR c.user2_id = ${userId}
      GROUP BY c.id, c.user1_id, c.user2_id, c.last_message_at, u.full_name, u.profile_image, u.role
      ORDER BY c.last_message_at DESC NULLS LAST
    `;

    const formatted = chats.map(c => ({
      id: c.id,
      otherUser: {
        id: c.other_id,
        fullName: c.other_name,
        profileImage: c.other_image,
        role: c.other_role,
      },
      lastMessageAt: c.last_message_at,
      lastContent: c.last_content,
      unreadCount: Number(c.unread_count ?? 0),
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/chats/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [chat] = await query<{ id: string; user1_id: string; user2_id: string }>`
      SELECT id, user1_id, user2_id FROM chats WHERE id = ${id}
    `;

    if (!chat) return next(notFound('Chat'));
    if (chat.user1_id !== userId && chat.user2_id !== userId) {
      return next(forbidden('Not your chat'));
    }

    await query`DELETE FROM chats WHERE id = ${id}`;
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export default router;
