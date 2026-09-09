import { api } from './client';
import type { SchemeMatch, SchemeRead, SchemeSummary } from './types';

export const schemesService = {
  list(params: { q?: string; category?: string; level?: string; limit?: number; offset?: number }, token: string) {
    return api.get<{ total: number; results: SchemeSummary[] }>('/schemes', params as Record<string, unknown>, token);
  },

  get(id: string, token: string) {
    return api.get<SchemeRead>(`/schemes/${id}`, undefined, token);
  },

  matches(token: string) {
    return api.get<SchemeMatch[]>('/schemes/matches', undefined, token);
  },
};
