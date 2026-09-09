import { api } from './client';
import type { GovChatResponse, GovService } from './types';

export const govServicesService = {
  search(params: { q: string; mode?: string; limit?: number }) {
    return api.get<GovService[]>('/services/search', params as Record<string, unknown>);
  },

  get(id: number) {
    return api.get<GovService>(`/services/${id}`);
  },

  chat(payload: { message: string; serviceIds?: number[]; limit?: number }) {
    return api.post<GovChatResponse>('/services/chat', payload);
  },
};
