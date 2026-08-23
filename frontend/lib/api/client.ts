/**
 * Single Axios instance for the Sahayak government-data API (the collector
 * service). One place configures base URL, timeout, logging interceptors and
 * global error normalisation, so every api module stays tiny and consistent.
 *
 * Base URL comes from the environment — never hardcoded:
 *   NEXT_PUBLIC_API_BASE_URL=/api    (default; proxied to the main backend)
 */
import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

// Same-origin base: the browser calls the MAIN backend through the Next.js
// `/api` rewrite (see next.config.mjs), which proxies gov endpoints to the
// collector. This keeps the intended flow: frontend → main backend → collector,
// and avoids cross-origin/CORS entirely. Override only for special setups.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

const isDev = process.env.NODE_ENV !== 'production';

/** Normalised error surfaced to hooks/components. */
export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Request logging ----
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug(`[api] → ${config.method?.toUpperCase()} ${config.url}`, config.params ?? '');
  }
  return config;
});

// ---- Response logging + global error handling ----
apiClient.interceptors.response.use(
  (response) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug(`[api] ← ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError<{ detail?: string; error?: { code?: string; message?: string } }>) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const message =
      data?.error?.message ||
      (typeof data?.detail === 'string' ? data.detail : undefined) ||
      error.message ||
      'Network error';
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(`[api] ✕ ${status} ${error.config?.url}: ${message}`);
    }
    return Promise.reject(new ApiError(message, status, data?.error?.code));
  },
);

/** Small helper so modules return the payload directly. */
export async function unwrap<T>(p: Promise<{ data: T }>): Promise<T> {
  return (await p).data;
}
