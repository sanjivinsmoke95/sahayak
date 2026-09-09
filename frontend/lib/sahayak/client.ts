import axios, { AxiosRequestConfig } from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

function headers(token?: string) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function request<T>(config: AxiosRequestConfig & { token?: string }): Promise<T> {
  const { token, ...rest } = config;
  try {
    const res = await axios({ baseURL: BASE, timeout: 20_000, headers: headers(token), ...rest });
    return res.data as T;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg = err.response?.data?.detail ?? err.response?.data?.message ?? err.message;
      throw new ApiError(msg, err.response?.status ?? 0);
    }
    throw err;
  }
}

export const api = {
  get<T>(url: string, params?: Record<string, unknown>, token?: string) {
    return request<T>({ method: 'GET', url, params, token });
  },
  post<T>(url: string, data?: unknown, token?: string) {
    return request<T>({ method: 'POST', url, data, token });
  },
  patch<T>(url: string, data?: unknown, token?: string) {
    return request<T>({ method: 'PATCH', url, data, token });
  },
  delete<T>(url: string, token?: string) {
    return request<T>({ method: 'DELETE', url, token });
  },
  async upload<T>(url: string, form: FormData, token?: string): Promise<T> {
    try {
      const res = await axios.post(`${BASE}${url}`, form, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'multipart/form-data' },
        timeout: 60_000,
      });
      return res.data as T;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.detail ?? err.response?.data?.message ?? err.message;
        throw new ApiError(msg, err.response?.status ?? 0);
      }
      throw err;
    }
  },
};
