import { api } from './client';
import type { Place } from './types';

export const placesService = {
  meeSeva(params: { lat: number; lng: number; radius?: number }) {
    return api.get<Place[]>('/places/mee-seva', params as Record<string, unknown>);
  },
};
