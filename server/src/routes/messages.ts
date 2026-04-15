import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/client.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { badRequest, forbidden, notFound } from '../utils/errors.js';
import { createNotification } from '../services/notifications.js';

const sendMessageSchema = z.object({
  receiverId: z.string().uuid('receiverId must be a valid UUID'),
  content: z.string().min(1, 'content is required'),
  attachmentData: z.string().optional(),
  attachmentName: z.string().optional(),
  attachmentType: z.string().optional(),
});

const router = Router();

interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachment_data: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

function formatMessage(m: MessageRow) {
  return {
    id: m.id,
    senderId: m.sender_id,
    receiverId: m.receiver_id,
    content: m.content,
    attachmentData: m.attachment_data,
    attachmentName: m.attachment_name,
    attachmentType: m.attachment_type,
    isRead: m.is_read,
    readAt: m.read_at,
    createdAt: m.created_at,
  };
}

// POST /api/messages
router.post('/', requireAuth, validateBody(sendMessageSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { receiverId, content, attachmentData, attachmentName, attachmentType } =
      req.body as z.infer<typeof sendMessageSchema>;

    if (receiverId === req.user!.id) {
      return next(badRequest('Cannot send message to yourself'));
    }

    const [receiver] = await query<{ id: string; full_name: string }>`
      SELECT id, full_name FROM users WHERE id = ${receiverId}
    `;
    if (!receiver) return next(notFound('Receiver'));

    const [message] = await query<MessageRow>`
      INSERT INTO messages (sender_id, receiver_id, content, attachment_data, attachment_name, attachment_type)
      VALUES (${req.user!.id}, ${receiverId}, ${content}, ${attachmentData ?? null}, ${attachmentName ?? null}, ${attachmentType ?? null})
      RETURNING *
    `;

    // Upsert chat record
    const [u1, u2] = [req.user!.id, receiverId].sort();
    await query`
      INSERT INTO chats (user1_id, user2_id, last_message_at)
      VALUES (${u1}, ${u2}, NOW())
      ON CONFLICT (user1_id, user2_id) DO UPDATE SET last_message_at = NOW()
    `;

    // Notify receiver
    await createNotification(
      receiverId,
      'message',
      'New message',
      `You have a new message`,
      message.id
    );

    res.status(201).json({ success: true, data: formatMessage(message) });
  } catch (err) {
    next(err);
  }
});

// GET /api/messages/with/:userId
router.get('/with/:userId', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(100, parseInt((req.query.limit as string) ?? '50', 10));
    const before = (req.query.before as string) ?? null;

    const messages = await query<MessageRow>`
      SELECT * FROM messages
      WHERE (
        (sender_id = ${req.user!.id} AND receiver_id = ${userId})
        OR (sender_id = ${userId} AND receiver_id = ${req.user!.id})
      )
      AND (${before} IS NULL OR created_at < ${before}::timestamptz)
      ORDER BY created_at ASC
      LIMIT ${limit}
    `;

    res.json({ success: true, data: messages.map(formatMessage) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/messages/:id/read
router.put('/:id/read', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const [msg] = await query<MessageRow>`
      SELECT * FROM messages WHERE id = ${id}
    `;

    if (!msg) return next(notFound('Message'));
    if (msg.receiver_id !== req.user!.id) return next(forbidden('Cannot mark this message as read'));

    await query`
      UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE id = ${id}
    `;

    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export default router;
