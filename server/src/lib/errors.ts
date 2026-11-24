/**
 * Application error with HTTP status code, machine-readable code, and optional details.
 * Services throw AppError; the central errorHandler middleware formats it into the API envelope.
 */
export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function validationError(message = 'Validation failed', details?: unknown): AppError {
  return new AppError(400, 'VALIDATION_ERROR', message, details);
}

export function unauthorizedError(message = 'Authentication required'): AppError {
  return new AppError(401, 'UNAUTHENTICATED', message);
}

export function forbiddenError(
  message = 'You do not have permission to perform this action',
): AppError {
  return new AppError(403, 'FORBIDDEN', message);
}

export function notFoundError(message = 'Resource not found'): AppError {
  return new AppError(404, 'NOT_FOUND', message);
}

export function conflictError(message = 'Resource conflict', details?: unknown): AppError {
  return new AppError(409, 'CONFLICT', message, details);
}
