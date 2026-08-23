import { api } from '@/lib/api-client';
import type { Application, ApplicationDetail, ApplicationStatus } from '@/types';

export const applicationsService = {
  list: (token?: string | null) => api.get<Application[]>('/applications', token),

  get: (id: string, token?: string | null) =>
    api.get<ApplicationDetail>(`/applications/${id}`, token),

  create: (serviceId: string, token?: string | null) =>
    api.post<ApplicationDetail>('/applications', { serviceId }, token),

  updateStatus: (
    id: string,
    status: ApplicationStatus,
    note: string | null,
    token?: string | null,
  ) => api.patch<ApplicationDetail>(`/applications/${id}`, { status, note }, token),
};
