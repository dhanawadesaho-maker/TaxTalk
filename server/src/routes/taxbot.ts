import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/client.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { badRequest, notFound, forbidden } from '../utils/errors.js';
import { streamTaxbotResponse, ConversationMessage } from '../services/groq.js';

const createConversationSchema = z.object({
  topic: z.string().min(1, 'topic is required'),
});

const createMessageSchema = z.object({
  content: z.string().min(1, 'content is required'),
});

const router = Router();

interface ConversationRow {
  id: string;
  user_id: string;
  topic: string;
  created_at: string;
}

interface TaxbotMessageRow {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
}

// POST /api/taxbot/conversations
router.post('/conversations', requireAuth, validateBody(createConversationSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { topic } = req.body as z.infer<typeof createConversationSchema>;

    const [conv] = await query<ConversationRow>`
      INSERT INTO taxbot_conversations (user_id, topic)
      VALUES (${req.user!.id}, ${topic})
      RETURNING *
    `;

    res.status(201).json({ success: true, data: conv });
  } catch (err) {
    next(err);
  }
});

// GET /api/taxbot/conversations
router.get('/conversations', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const conversations = await query<ConversationRow>`
      SELECT * FROM taxbot_conversations
      WHERE user_id = ${req.user!.id}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    res.json({ success: true, data: conversations });
  } catch (err) {
    next(err);
  }
});

// GET /api/taxbot/conversations/:id
router.get('/conversations/:id', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [conv] = await query<ConversationRow>`
      SELECT * FROM taxbot_conversations WHERE id = ${id}
    `;
    if (!conv) return next(notFound('Conversation'));
    if (conv.user_id !== req.user!.id) return next(forbidden('Not your conversation'));

    const messages = await query<TaxbotMessageRow>`
      SELECT * FROM taxbot_messages WHERE conversation_id = ${id} ORDER BY created_at ASC
    `;

    res.json({ success: true, data: { ...conv, messages } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/taxbot/conversations/:id
router.delete('/conversations/:id', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [conv] = await query<{ id: string; user_id: string }>`
      SELECT id, user_id FROM taxbot_conversations WHERE id = ${id}
    `;
    if (!conv) return next(notFound('Conversation'));
    if (conv.user_id !== req.user!.id) return next(forbidden('Not your conversation'));

    await query`DELETE FROM taxbot_conversations WHERE id = ${id}`;
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

// POST /api/taxbot/conversations/:id/messages
router.post('/conversations/:id/messages', requireAuth, validateBody(createMessageSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content } = req.body as z.infer<typeof createMessageSchema>;

    const [conv] = await query<ConversationRow>`
      SELECT * FROM taxbot_conversations WHERE id = ${id}
    `;
    if (!conv) return next(notFound('Conversation'));
    if (conv.user_id !== req.user!.id) return next(forbidden('Not your conversation'));

    // Save user message
    await query`
      INSERT INTO taxbot_messages (conversation_id, role, content)
      VALUES (${id}, 'user', ${content})
    `;

    // Fetch history for context
    const history = await query<TaxbotMessageRow>`
      SELECT role, content FROM taxbot_messages
      WHERE conversation_id = ${id}
      ORDER BY created_at ASC
    `;

    const contextMessages: ConversationMessage[] = history.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Stream response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';

    try {
      for await (const token of streamTaxbotResponse(contextMessages.slice(0, -1), content)) {
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }

      // Save assistant message
      await query`
        INSERT INTO taxbot_messages (conversation_id, role, content)
        VALUES (${id}, 'assistant', ${fullResponse})
      `;

      res.write(`data: ${JSON.stringify({ done: true, content: fullResponse })}\n\n`);
    } catch (streamErr) {
      res.write(`data: ${JSON.stringify({ error: 'AI response failed' })}\n\n`);
    }

    res.end();
  } catch (err) {
    next(err);
  }
});

export default router;
