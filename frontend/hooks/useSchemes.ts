'use client';

import { useQuery } from '@tanstack/react-query';
import { schemesService, type SchemeSearchParams } from '@/services';
import type { Scheme, SchemeMatchResult, SchemeSearchResult } from '@/types';
import { useDebouncedValue } from './useDebouncedValue';
import { useAuthToken } from './useAuthToken';

export function useSchemeSearch(params: SchemeSearchParams) {
  const getToken = useAuthToken();
  const debouncedQ = useDebouncedValue(params.q ?? '', 300);
  const effective = { ...params, q: debouncedQ };
  return useQuery<SchemeSearchResult>({
    queryKey: ['schemes', effective],
    queryFn: async () => schemesService.search(effective, await getToken()),
  });
}

export function useSchemeCategories() {
  const getToken = useAuthToken();
  return useQuery<string[]>({
    queryKey: ['scheme-categories'],
    queryFn: async () => schemesService.categories(await getToken()),
    staleTime: Infinity,
  });
}

export function useSchemeMatches() {
  const getToken = useAuthToken();
  return useQuery<SchemeMatchResult>({
    queryKey: ['scheme-matches'],
    queryFn: async () => schemesService.matches(await getToken()),
  });
}

export function useScheme(id: string) {
  const getToken = useAuthToken();
  return useQuery<Scheme>({
    queryKey: ['scheme', id],
    queryFn: async () => schemesService.get(id, await getToken()),
    enabled: !!id,
  });
}
