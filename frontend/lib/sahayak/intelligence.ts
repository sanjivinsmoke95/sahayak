import { api } from './client';
import type { ValidityRead, RejectionRead, ReadinessRead } from './types';

export const intelligenceService = {
  validity(slug: string, token: string) {
    return api.get<ValidityRead>(`/documents/${slug}/validity`, undefined, token);
  },

  rejection(slug: string, token: string) {
    return api.get<RejectionRead>(`/documents/${slug}/rejection`, undefined, token);
  },

  readiness(slug: string, serviceId: string, token: string) {
    return api.get<ReadinessRead>(`/documents/${slug}/readiness/${serviceId}`, undefined, token);
  },

  consistency(token: string) {
    return api.get<{
      conflicts: Array<{ field: string; value1: string; value2: string; docA: string; docB: string }>;
      suggestions: string[];
    }>('/consistency', undefined, token);
  },
};
