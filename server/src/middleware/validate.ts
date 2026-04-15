import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { badRequest } from '../utils/errors.js';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const msg = result.error.issues.map((e: { message: string }) => e.message).join('; ');
      return next(badRequest(msg));
    }
    req.body = result.data;
    next();
  };
}
