import type { ApiError } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class ApiRequestError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Clerk session token, attached by the query hooks. */
  token?: string | null;
}

/**
 * One place that knows how to talk to FastAPI. Every service file goes
 * through here so auth headers and error shapes stay consistent.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;
  const isFormData = body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const payload: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const err = payload as ApiError | null;
    throw new ApiRequestError(err?.detail || response.statusText, response.status, err?.code);
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, token?: string | null) => apiRequest<T>(path, { method: 'GET', token }),
  post: <T>(path: string, body?: unknown, token?: string | null) =>
    apiRequest<T>(path, { method: 'POST', body, token }),
  patch: <T>(path: string, body?: unknown, token?: string | null) =>
    apiRequest<T>(path, { method: 'PATCH', body, token }),
  delete: <T>(path: string, token?: string | null) =>
    apiRequest<T>(path, { method: 'DELETE', token }),
};
