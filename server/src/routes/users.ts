import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/client.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { badRequest, forbidden, notFound } from '../utils/errors.js';

const updateUserSchema = z.object({
  fullName: z.string().min(1, 'fullName must not be empty').optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  hourlyRate: z.number().nonnegative('hourlyRate must be non-negative').optional(),
  caNumber: z.string().optional(),
  workExperience: z.number().int().nonnegative('workExperience must be a non-negative integer').optional(),
  specializations: z.array(z.string().min(1)).optional(),
});

const addSpecializationSchema = z.object({
  specialization: z.string().min(1, 'specialization is required'),
});

const router = Router();

interface UserSearchRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  bio: string | null;
  profile_image: string | null;
  hourly_rate: number | null;
  ca_number: string | null;
  work_experience: number | null;
  is_verified: boolean;
  created_at: string;
  specializations: string[];
  avg_rating: number | null;
  rating_count: number;
}

function formatUser(u: UserSearchRow) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.full_name,
    phone: u.phone,
    role: u.role,
    bio: u.bio,
    profileImage: u.profile_image,
    hourlyRate: u.hourly_rate,
    caNumber: u.ca_number,
    workExperience: u.work_experience,
    isVerified: u.is_verified,
    createdAt: u.created_at,
    specializations: u.specializations ?? [],
    avgRating: u.avg_rating ? Number(u.avg_rating) : null,
    ratingCount: Number(u.rating_count ?? 0),
  };
}

// GET /api/users/search?q=&specialization=&minRating=&minExperience=&page=&limit=
router.get('/search', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string) ?? '';
    const specialization = (req.query.specialization as string) ?? '';
    const minRating = parseFloat((req.query.minRating as string) ?? '0') || 0;
    const minExperience = parseInt((req.query.minExperience as string) ?? '0', 10) || 0;
    const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) ?? '20', 10)));
    const offset = (page - 1) * limit;

    const rows = await query<UserSearchRow & { total_count: number }>`
      SELECT
        u.id, u.email, u.full_name, u.phone, u.role, u.bio, u.profile_image,
        u.hourly_rate, u.ca_number, u.work_experience, u.is_verified, u.created_at,
        COALESCE(ARRAY_AGG(DISTINCT cs.specialization) FILTER (WHERE cs.specialization IS NOT NULL), '{}') AS specializations,
        AVG(r.rating) AS avg_rating,
        COUNT(DISTINCT r.id) AS rating_count,
        COUNT(*) OVER() AS total_count
      FROM users u
      LEFT JOIN ca_specializations cs ON cs.ca_id = u.id
      LEFT JOIN ratings r ON r.ca_id = u.id
      WHERE u.role = 'ca'
        AND (
          ${q} = ''
          OR u.full_name ILIKE ${'%' + q + '%'}
          OR u.bio ILIKE ${'%' + q + '%'}
        )
        AND (${specialization} = '' OR cs.specialization = ${specialization})
        AND u.work_experience >= ${minExperience}
      GROUP BY u.id
      HAVING ${minRating} = 0 OR AVG(r.rating) >= ${minRating}
      ORDER BY AVG(r.rating) DESC NULLS LAST, u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const total = rows[0]?.total_count ?? 0;

    res.json({
      success: true,
      data: rows.map(formatUser),
      meta: { total: Number(total), page, limit },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const [user] = await query<UserSearchRow>`
      SELECT
        u.id, u.email, u.full_name, u.phone, u.role, u.bio, u.profile_image,
        u.hourly_rate, u.ca_number, u.work_experience, u.is_verified, u.created_at,
        COALESCE(ARRAY_AGG(DISTINCT cs.specialization) FILTER (WHERE cs.specialization IS NOT NULL), '{}') AS specializations,
        AVG(r.rating) AS avg_rating,
        COUNT(DISTINCT r.id) AS rating_count
      FROM users u
      LEFT JOIN ca_specializations cs ON cs.ca_id = u.id
      LEFT JOIN ratings r ON r.ca_id = u.id
      WHERE u.id = ${id}
      GROUP BY u.id
    `;

    if (!user) return next(notFound('User'));
    res.json({ success: true, data: formatUser(user) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id
router.put('/:id', requireAuth, validateBody(updateUserSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (req.user!.id !== id) return next(forbidden('You can only update your own profile'));

    const { fullName, phone, bio, profileImage, hourlyRate, caNumber, workExperience, specializations } =
      req.body as z.infer<typeof updateUserSchema>;

    const [updated] = await query<UserSearchRow>`
      UPDATE users SET
        full_name = COALESCE(${fullName ?? null}, full_name),
        phone = COALESCE(${phone ?? null}, phone),
        bio = COALESCE(${bio ?? null}, bio),
        profile_image = COALESCE(${profileImage ?? null}, profile_image),
        hourly_rate = COALESCE(${hourlyRate ?? null}, hourly_rate),
        ca_number = COALESCE(${caNumber ?? null}, ca_number),
        work_experience = COALESCE(${workExperience ?? null}, work_experience),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, full_name, phone, role, bio, profile_image,
                hourly_rate, ca_number, work_experience, is_verified, created_at
    `;

    if (!updated) return next(notFound('User'));

    if (Array.isArray(specializations)) {
      await query`DELETE FROM ca_specializations WHERE ca_id = ${id}`;
      for (const spec of specializations) {
        await query`
          INSERT INTO ca_specializations (ca_id, specialization)
          VALUES (${id}, ${spec})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    const specs = await query<{ specialization: string }>`
      SELECT specialization FROM ca_specializations WHERE ca_id = ${id}
    `;

    res.json({
      success: true,
      data: {
        ...formatUser({ ...updated, specializations: specs.map(s => s.specialization), avg_rating: null, rating_count: 0 }),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id/specializations
router.get('/:id/specializations', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const specs = await query<{ specialization: string }>`
      SELECT specialization FROM ca_specializations WHERE ca_id = ${id} ORDER BY specialization
    `;
    res.json({ success: true, data: specs.map(s => s.specialization) });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/:id/specializations
router.post('/:id/specializations', requireAuth, validateBody(addSpecializationSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (req.user!.id !== id) return next(forbidden('You can only update your own specializations'));

    const { specialization } = req.body as z.infer<typeof addSpecializationSchema>;

    await query`
      INSERT INTO ca_specializations (ca_id, specialization)
      VALUES (${id}, ${specialization})
      ON CONFLICT DO NOTHING
    `;

    res.status(201).json({ success: true, data: { specialization } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id/specializations/:spec
router.delete('/:id/specializations/:spec', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, spec } = req.params;
    if (req.user!.id !== id) return next(forbidden('You can only update your own specializations'));

    await query`
      DELETE FROM ca_specializations WHERE ca_id = ${id} AND specialization = ${spec}
    `;

    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export default router;
