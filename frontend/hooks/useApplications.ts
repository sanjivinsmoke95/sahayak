'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applicationsService } from '@/services';
import type { Application, ApplicationDetail, ApplicationStatus } from '@/types';
import { useAuthToken } from './useAuthToken';

export function useApplications() {
  const getToken = useAuthToken();
  return useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: async () => applicationsService.list(await getToken()),
  });
}

export function useApplication(id: string) {
  const getToken = useAuthToken();
  return useQuery<ApplicationDetail>({
    queryKey: ['application', id],
    queryFn: async () => applicationsService.get(id, await getToken()),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const getToken = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation<ApplicationDetail, Error, string>({
    mutationFn: async (serviceId) => applicationsService.create(serviceId, await getToken()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });
}

export function useUpdateApplicationStatus(id: string) {
  const getToken = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation<ApplicationDetail, Error, { status: ApplicationStatus; note?: string | null }>({
    mutationFn: async ({ status, note }) =>
      applicationsService.updateStatus(id, status, note ?? null, await getToken()),
    onSuccess: (data) => {
      queryClient.setQueryData(['application', id], data);
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
