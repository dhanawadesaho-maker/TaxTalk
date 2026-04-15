import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorized } from '../utils/errors.js';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

export function requireAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(unauthorized('No token provided'));
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new Error('JWT_SECRET not configured'));
  }

  try {
    const payload = jwt.verify(token, secret) as {
      id: string;
      role: string;
      email: string;
    };
    req.user = payload;
    next();
  } catch {
    next(unauthorized('Invalid or expired token'));
  }
}

export function requireCA(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== 'ca') {
    return next(unauthorized('CA access required'));
  }
  next();
}
