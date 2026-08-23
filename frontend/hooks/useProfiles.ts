'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { profilesService } from '@/services';
import type { Profile, ProfileCreatePayload } from '@/types';
import { useAuthToken } from './useAuthToken';

export function useProfiles() {
  const getToken = useAuthToken();
  return useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => profilesService.list(await getToken()),
  });
}

export function useCreateProfile() {
  const getToken = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation<Profile, Error, ProfileCreatePayload>({
    mutationFn: async (payload) => profilesService.create(payload, await getToken()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  });
}

export function useDeleteProfile() {
  const getToken = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => profilesService.remove(id, await getToken()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profiles'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents });
    },
  });
}

export function useAssignDocumentProfile() {
  const getToken = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { slug: string; profileId: string }>({
    mutationFn: async ({ slug, profileId }) =>
      profilesService.assignDocument(slug, profileId, await getToken()),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.document(variables.slug) });
    },
  });
}
