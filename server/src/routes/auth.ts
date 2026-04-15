import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/client.js';
import { hashPassword, verifyPassword, generateToken } from '../services/auth.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { badRequest, conflict, unauthorized } from '../utils/errors.js';

const router = Router();

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'fullName is required'),
  role: z.enum(['client', 'ca'], { message: 'role must be "client" or "ca"' }),
  phone: z.string().optional(),
  caNumber: z.string().optional(),
  workExperience: z.number().int().nonnegative().optional(),
  specializations: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'currentPassword is required'),
  newPassword: z.string().min(8, 'newPassword must be at least 8 characters'),
});

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
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
}

// POST /api/auth/signup
router.post('/signup', validateBody(signupSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName, phone, role, caNumber, workExperience, specializations } =
      req.body as z.infer<typeof signupSchema>;

    const existing = await query<{ id: string }>`
      SELECT id FROM users WHERE email = ${email}
    `;
    if (existing.length > 0) {
      return next(conflict('An account with this email already exists'));
    }

    const passwordHash = await hashPassword(password);

    const [user] = await query<UserRow>`
      INSERT INTO users (email, password_hash, full_name, phone, role, ca_number, work_experience)
      VALUES (${email}, ${passwordHash}, ${fullName}, ${phone ?? null}, ${role}, ${caNumber ?? null}, ${workExperience ?? null})
      RETURNING id, email, full_name, phone, role, bio, profile_image, hourly_rate, ca_number, work_experience, is_verified, created_at
    `;

    if (role === 'ca' && Array.isArray(specializations) && specializations.length > 0) {
      for (const spec of specializations) {
        await query`
          INSERT INTO ca_specializations (ca_id, specialization)
          VALUES (${user.id}, ${spec})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    const token = generateToken({ id: user.id, role: user.role, email: user.email });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          phone: user.phone,
          role: user.role,
          bio: user.bio,
          profileImage: user.profile_image,
          hourlyRate: user.hourly_rate,
          caNumber: user.ca_number,
          workExperience: user.work_experience,
          isVerified: user.is_verified,
          createdAt: user.created_at,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    const [user] = await query<UserRow>`
      SELECT id, email, password_hash, full_name, phone, role, bio, profile_image,
             hourly_rate, ca_number, work_experience, is_verified, created_at
      FROM users WHERE email = ${email}
    `;

    if (!user) {
      return next(unauthorized('Invalid email or password'));
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return next(unauthorized('Invalid email or password'));
    }

    const token = generateToken({ id: user.id, role: user.role, email: user.email });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          phone: user.phone,
          role: user.role,
          bio: user.bio,
          profileImage: user.profile_image,
          hourlyRate: user.hourly_rate,
          caNumber: user.ca_number,
          workExperience: user.work_experience,
          isVerified: user.is_verified,
          createdAt: user.created_at,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [user] = await query<UserRow & { specializations: string[] }>`
      SELECT u.id, u.email, u.full_name, u.phone, u.role, u.bio, u.profile_image,
             u.hourly_rate, u.ca_number, u.work_experience, u.is_verified, u.created_at,
             COALESCE(ARRAY_AGG(cs.specialization) FILTER (WHERE cs.specialization IS NOT NULL), '{}') AS specializations
      FROM users u
      LEFT JOIN ca_specializations cs ON cs.ca_id = u.id
      WHERE u.id = ${req.user!.id}
      GROUP BY u.id
    `;

    if (!user) {
      return next(unauthorized('User not found'));
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
        bio: user.bio,
        profileImage: user.profile_image,
        hourlyRate: user.hourly_rate,
        caNumber: user.ca_number,
        workExperience: user.work_experience,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        specializations: user.specializations,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/password
router.put('/password', requireAuth, validateBody(changePasswordSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>;

    const [user] = await query<{ password_hash: string }>`
      SELECT password_hash FROM users WHERE id = ${req.user!.id}
    `;
    if (!user) return next(unauthorized('User not found'));

    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) return next(unauthorized('Current password is incorrect'));

    const newHash = await hashPassword(newPassword);
    await query`UPDATE users SET password_hash = ${newHash}, updated_at = NOW() WHERE id = ${req.user!.id}`;

    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout (stateless JWT — client drops token)
router.post('/logout', requireAuth, (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: null });
});

export default router;
