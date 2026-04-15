export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const notFound = (resource: string) =>
  new AppError(`${resource} not found`, 404, 'NOT_FOUND');

export const unauthorized = (msg = 'Unauthorized') =>
  new AppError(msg, 401, 'UNAUTHORIZED');

export const forbidden = (msg = 'Forbidden') =>
  new AppError(msg, 403, 'FORBIDDEN');

export const badRequest = (msg: string) =>
  new AppError(msg, 400, 'BAD_REQUEST');

export const conflict = (msg: string) =>
  new AppError(msg, 409, 'CONFLICT');
