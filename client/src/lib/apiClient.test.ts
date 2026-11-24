import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient, apiFetch } from './apiClient';

function mockFetchResponse(init: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  body?: unknown;
}) {
  const status = init.status ?? 200;
  const ok = init.ok ?? (status >= 200 && status < 300);
  const text = init.body === undefined ? '' : JSON.stringify(init.body);

  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: init.statusText ?? '',
    text: async () => text,
  });
}

describe('apiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('prefixes /api/v1, sends credentials: include, and parses JSON', async () => {
    const fetchMock = mockFetchResponse({ status: 200, body: { data: { status: 'ok' } } });
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiClient.get<{ data: { status: string } }>('/health');

    expect(result).toEqual({ data: { status: 'ok' } });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/health');
    expect(options.credentials).toBe('include');
    expect(options.method).toBe('GET');
  });

  it('does not double-prefix /api/v1 and serializes JSON bodies on POST', async () => {
    const fetchMock = mockFetchResponse({ status: 201, body: { data: { id: 'u1' } } });
    vi.stubGlobal('fetch', fetchMock);

    const res = await apiClient.post<{ data: { id: string } }>('/api/v1/auth/login', {
      email: 'a@b.com',
      password: 'secret',
    });

    expect(res).toEqual({ data: { id: 'u1' } });
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/auth/login');
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify({ email: 'a@b.com', password: 'secret' }));
    expect(new Headers(options.headers).get('Content-Type')).toBe('application/json');
  });

  it('handles 204 No Content without parsing JSON', async () => {
    const fetchMock = mockFetchResponse({ status: 204 });
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiClient.post<void>('/auth/logout');
    expect(result).toBeUndefined();
  });

  it('throws a typed ApiError matching the API contract error envelope', async () => {
    const fetchMock = mockFetchResponse({
      status: 400,
      statusText: 'Bad Request',
      body: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: { email: ['Invalid email'] },
        },
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiFetch('/auth/register', { method: 'POST', body: {} })).rejects.toSatisfy(
      (err: unknown) => {
        expect(err).toBeInstanceOf(ApiError);
        const apiErr = err as ApiError;
        expect(apiErr.status).toBe(400);
        expect(apiErr.code).toBe('VALIDATION_ERROR');
        expect(apiErr.message).toBe('Invalid input');
        expect(apiErr.details).toEqual({ email: ['Invalid email'] });
        return true;
      },
    );
  });

  it('falls back to HTTP_ERROR when error response has no JSON envelope', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      text: async () => '<html>Bad Gateway</html>',
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.get('/products')).rejects.toMatchObject({
      name: 'ApiError',
      status: 502,
      code: 'HTTP_ERROR',
      message: 'Bad Gateway',
    });
  });
});
