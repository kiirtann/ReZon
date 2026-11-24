// In dev, VITE_API_URL is unset and Vite proxies /api/* to localhost:4000.
// In production, set VITE_API_URL (e.g. https://api.shoplearn.onrender.com) if hosted on a separate origin.
const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
const API_BASE_PATH = '/api/v1';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

/**
 * Typed error thrown by `apiClient` when the server returns a non-2xx response
 * matching the error envelope in `docs/04-API_CONTRACT.md`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

function buildUrl(path: string): string {
  if (path.startsWith(API_BASE_PATH)) {
    return `${API_ORIGIN}${path}`;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${API_BASE_PATH}${normalizedPath}`;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

/**
 * Typed fetch wrapper that prefixes `/api/v1`, sends httpOnly cookies (`credentials: 'include'`),
 * handles `204 No Content`, and converts error responses into `ApiError`.
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json');
  }

  let serializedBody: BodyInit | undefined;
  if (body !== undefined) {
    if (body instanceof FormData || typeof body === 'string') {
      serializedBody = body;
    } else {
      if (!requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }
      serializedBody = JSON.stringify(body);
    }
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: requestHeaders,
    body: serializedBody,
    credentials: 'include',
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    const errorBody = (payload as ApiErrorPayload | undefined)?.error;
    const code = errorBody?.code ?? 'HTTP_ERROR';
    const message =
      errorBody?.message ?? (response.statusText || `Request failed (${response.status})`);
    throw new ApiError(response.status, code, message, errorBody?.details);
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
