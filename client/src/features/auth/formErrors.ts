import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from '../../lib/apiClient';

/**
 * Maps `400 VALIDATION_ERROR` field errors (`Record<string, string[]>`) from the API
 * onto `react-hook-form` fields, and returns a top-level banner message for non-field errors.
 */
export function handleAuthApiError<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  allowedFields: readonly (keyof TFieldValues & string)[],
  fallbackMessage: string,
): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : fallbackMessage;
  }

  if (error.code === 'VALIDATION_ERROR' && error.details && typeof error.details === 'object') {
    const details = error.details as Record<string, unknown>;
    let appliedFieldError = false;

    for (const field of allowedFields) {
      const value = details[field];
      const message = Array.isArray(value)
        ? typeof value[0] === 'string'
          ? value[0]
          : undefined
        : typeof value === 'string'
          ? value
          : undefined;

      if (message) {
        setError(field as Path<TFieldValues>, { type: 'server', message });
        appliedFieldError = true;
      }
    }

    if (appliedFieldError) {
      return 'Please fix the highlighted fields and try again.';
    }
  }

  return error.message || fallbackMessage;
}
