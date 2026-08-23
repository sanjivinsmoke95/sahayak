import { api } from '@/lib/api-client';
import type { MapsConfig, MeeSevaResponse } from '@/types';

export const placesService = {
  /** Whether maps are configured, and the browser key for the interactive map. */
  config: (token?: string | null) => api.get<MapsConfig>('/places/config', token),

  /** Nearby Mee Seva centres for a coordinate. */
  meeSeva: (lat: number, lng: number, token?: string | null) =>
    api.get<MeeSevaResponse>(
      `/places/mee-seva?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
      token,
    ),
};
