/** Search endpoint: keyword | semantic | hybrid with filters. */
import type { GovSearchResponse, ServiceSearchParams } from '@/types';
import { apiClient, unwrap } from './client';

export const searchApi = {
  search: (params: ServiceSearchParams) =>
    unwrap<GovSearchResponse>(apiClient.get('/services/search', { params })),
};
