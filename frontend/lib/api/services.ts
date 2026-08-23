/** Services endpoints: list (paginated/filtered), detail, version history. */
import type {
  GovService,
  GovServiceVersion,
  PaginatedServices,
  ServiceListParams,
} from '@/types';
import { apiClient, unwrap } from './client';

export const servicesApi = {
  list: (params: ServiceListParams = {}) =>
    unwrap<PaginatedServices>(apiClient.get('/services', { params })),

  getById: (id: number) => unwrap<GovService>(apiClient.get(`/services/${id}`)),

  history: (id: number) =>
    unwrap<GovServiceVersion[]>(apiClient.get(`/services/${id}/history`)),
};
