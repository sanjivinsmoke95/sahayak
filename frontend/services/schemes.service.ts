import { api } from '@/lib/api-client';
import type { Scheme, SchemeMatchResult, SchemeSearchResult } from '@/types';

export interface SchemeSearchParams {
  q?: string;
  category?: string;
  level?: string;
  limit?: number;
  offset?: number;
}

export const schemesService = {
  search: (params: SchemeSearchParams, token?: string | null) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.category) qs.set('category', params.category);
    if (params.level) qs.set('level', params.level);
    qs.set('limit', String(params.limit ?? 20));
    qs.set('offset', String(params.offset ?? 0));
    return api.get<SchemeSearchResult>(`/schemes?${qs.toString()}`, token);
  },

  categories: (token?: string | null) => api.get<string[]>('/schemes/categories', token),

  matches: (token?: string | null) => api.get<SchemeMatchResult>('/schemes/matches', token),

  get: (id: string, token?: string | null) => api.get<Scheme>(`/schemes/${id}`, token),
};
