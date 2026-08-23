'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { settingsService } from '@/services';
import { useSettingsStore } from '@/store';
import type { UserSettings } from '@/types';
import { useAuthToken } from './useAuthToken';

/**
 * Server settings are the source of truth across devices; the Zustand store
 * is the fast local mirror. This syncs the two in one direction on load and
 * the other on change.
 */
export function useSettingsSync() {
  const getToken = useAuthToken();
  const hydrateFromServer = useSettingsStore((s) => s.hydrateFromServer);

  const query = useQuery<UserSettings>({
    queryKey: QUERY_KEYS.settings,
    queryFn: async () => settingsService.get(await getToken()),
    retry: false,
  });

  useEffect(() => {
    if (query.data) hydrateFromServer(query.data);
  }, [query.data, hydrateFromServer]);

  return query;
}

export function useUpdateSettings() {
  const getToken = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<UserSettings>) =>
      settingsService.update(payload, await getToken()),
    onSuccess: (data) => queryClient.setQueryData(QUERY_KEYS.settings, data),
  });
}
