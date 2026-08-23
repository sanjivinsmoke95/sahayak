/**
 * Government services facade — now backed by the dedicated Axios API layer
 * (lib/api) that talks to the collector's /services and /search endpoints.
 * Signatures kept stable for existing imports; prefer the React Query hooks
 * (useServices / useSearchServices) in components.
 */
import { searchApi, servicesApi } from '@/lib/api';
import type {
  GovSearchResponse,
  GovService,
  PaginatedServices,
  ServiceListParams,
  ServiceSearchParams,
} from '@/types';

export const govServicesService = {
  search: (params: ServiceSearchParams): Promise<GovSearchResponse> =>
    searchApi.search(params),

  list: (params: ServiceListParams = {}): Promise<PaginatedServices> =>
    servicesApi.list(params),

  getById: (id: number): Promise<GovService> => servicesApi.getById(id),
};
