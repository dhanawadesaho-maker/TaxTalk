import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/client.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { badRequest, forbidden, notFound } from '../utils/errors.js';
import { createNotification } from '../services/notifications.js';

const router = Router();

const uploadDocumentSchema = z.object({
  filename: z.string().min(1, 'filename is required'),
  fileData: z.string().min(1, 'fileData is required'),
  fileType: z.string().optional(),
  fileSize: z.number().int().nonnegative().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

const shareDocumentSchema = z.object({
  shareWithId: z.string().uuid('shareWithId must be a valid UUID'),
});

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

interface DocumentRow {
  id: string;
  owner_id: string;
  filename: string;
  file_type: string | null;
  file_size: number | null;
  category: string | null;
  description: string | null;
  created_at: string;
}

function formatDoc(d: DocumentRow) {
  return {
    id: d.id,
    ownerId: d.owner_id,
    filename: d.filename,
    fileType: d.file_type,
    fileSize: d.file_size,
    category: d.category,
    description: d.description,
    createdAt: d.created_at,
  };
}

// POST /api/documents
router.post('/', requireAuth, validateBody(uploadDocumentSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { filename, fileData, fileType, fileSize, category, description } =
      req.body as z.infer<typeof uploadDocumentSchema>;

    if (fileType && !ALLOWED_TYPES.includes(fileType)) {
      return next(badRequest('File type not allowed'));
    }
    if (fileSize && fileSize > MAX_SIZE_BYTES) {
      return next(badRequest('File size must not exceed 5MB'));
    }

    const [doc] = await query<DocumentRow>`
      INSERT INTO documents (owner_id, filename, file_data, file_type, file_size, category, description)
      VALUES (${req.user!.id}, ${filename}, ${fileData}, ${fileType ?? null}, ${fileSize ?? null}, ${category ?? null}, ${description ?? null})
      RETURNING id, owner_id, filename, file_type, file_size, category, description, created_at
    `;

    res.status(201).json({ success: true, data: formatDoc(doc) });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents — list owned documents
router.get('/', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const docs = await query<DocumentRow>`
      SELECT id, owner_id, filename, file_type, file_size, category, description, created_at
      FROM documents
      WHERE owner_id = ${req.user!.id}
      ORDER BY created_at DESC
    `;
    res.json({ success: true, data: docs.map(formatDoc) });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/shared-with-me
router.get('/shared-with-me', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const docs = await query<DocumentRow & { owner_name: string }>`
      SELECT d.id, d.owner_id, d.filename, d.file_type, d.file_size, d.category, d.description, d.created_at,
             u.full_name AS owner_name
      FROM documents d
      JOIN document_shares ds ON ds.document_id = d.id
      JOIN users u ON u.id = d.owner_id
      WHERE ds.shared_with = ${req.user!.id}
      ORDER BY d.created_at DESC
    `;
    const formatted = docs.map(d => ({ ...formatDoc(d), ownerName: d.owner_name }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id/download
router.get('/:id/download', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [doc] = await query<DocumentRow & { file_data: string }>`
      SELECT d.* FROM documents d
      LEFT JOIN document_shares ds ON ds.document_id = d.id AND ds.shared_with = ${userId}
      WHERE d.id = ${id} AND (d.owner_id = ${userId} OR ds.shared_with = ${userId})
    `;

    if (!doc) return next(notFound('Document'));

    res.json({ success: true, data: { ...formatDoc(doc), fileData: doc.file_data } });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/:id/share
router.post('/:id/share', requireAuth, validateBody(shareDocumentSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { shareWithId } = req.body as z.infer<typeof shareDocumentSchema>;

    const [doc] = await query<{ id: string; owner_id: string; filename: string }>`
      SELECT id, owner_id, filename FROM documents WHERE id = ${id}
    `;
    if (!doc) return next(notFound('Document'));
    if (doc.owner_id !== req.user!.id) return next(forbidden('Not your document'));

    const [shareWith] = await query<{ id: string }>`SELECT id FROM users WHERE id = ${shareWithId}`;
    if (!shareWith) return next(notFound('User to share with'));

    await query`
      INSERT INTO document_shares (document_id, shared_with)
      VALUES (${id}, ${shareWithId})
      ON CONFLICT DO NOTHING
    `;

    await createNotification(
      shareWithId,
      'document_share',
      'Document shared with you',
      `A document "${doc.filename}" has been shared with you`,
      id
    );

    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const [doc] = await query<{ owner_id: string }>`SELECT owner_id FROM documents WHERE id = ${id}`;

    if (!doc) return next(notFound('Document'));
    if (doc.owner_id !== req.user!.id) return next(forbidden('Not your document'));

    await query`DELETE FROM documents WHERE id = ${id}`;
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export default router;
