'use client';

/**
 * React Query hooks over the government-data API. They provide caching,
 * background refetch, loading/error states and retry out of the box — the UI
 * just reads `data`, `isLoading`, `isError`.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  crawlerApi,
  healthApi,
  searchApi,
  servicesApi,
  statsApi,
} from '@/lib/api';
import type {
  ServiceListParams,
  ServiceSearchParams,
} from '@/types';
import { useDebouncedValue } from './useDebouncedValue';

/** Centralised query keys so caches invalidate predictably. */
export const govKeys = {
  all: ['gov'] as const,
  health: () => [...govKeys.all, 'health'] as const,
  stats: () => [...govKeys.all, 'stats'] as const,
  services: (p: ServiceListParams) => [...govKeys.all, 'services', p] as const,
  service: (id: number) => [...govKeys.all, 'service', id] as const,
  history: (id: number) => [...govKeys.all, 'history', id] as const,
  search: (p: ServiceSearchParams) => [...govKeys.all, 'search', p] as const,
};

/** Paginated / filtered services list (Services page). */
export function useServices(params: ServiceListParams = {}) {
  return useQuery({
    queryKey: govKeys.services(params),
    queryFn: () => servicesApi.list(params),
    placeholderData: (prev) => prev, // keep previous page while fetching next
  });
}

/** One service by id (Service details page). */
export function useService(id: number | null) {
  return useQuery({
    queryKey: govKeys.service(id ?? -1),
    queryFn: () => servicesApi.getById(id as number),
    enabled: id != null,
  });
}

/** Version history for a service. */
export function useServiceHistory(id: number | null) {
  return useQuery({
    queryKey: govKeys.history(id ?? -1),
    queryFn: () => servicesApi.history(id as number),
    enabled: id != null,
  });
}

/** Home-page statistics. */
export function useStats() {
  return useQuery({
    queryKey: govKeys.stats(),
    queryFn: () => statsApi.get(),
    staleTime: 60_000,
  });
}

/** Backend health, polled — drives the offline banner. */
export function useBackendHealth(enabled = true) {
  return useQuery({
    queryKey: govKeys.health(),
    queryFn: () => healthApi.get(),
    enabled,
    refetchInterval: 30_000,
    retry: 1,
    staleTime: 15_000,
  });
}

/**
 * Debounced semantic/keyword/hybrid search. Pass the raw input; the hook
 * debounces it and only queries for inputs of length >= 2.
 */
export function useSearchServices(
  query: string,
  opts: Omit<ServiceSearchParams, 'q'> = {},
) {
  const debounced = useDebouncedValue(query.trim(), 350);
  const enabled = debounced.length >= 2;
  const params: ServiceSearchParams = { q: debounced, ...opts };
  return {
    ...useQuery({
      queryKey: govKeys.search(params),
      queryFn: () => searchApi.search(params),
      enabled,
    }),
    debouncedQuery: debounced,
    isTyping: query.trim() !== debounced,
  };
}

/** Trigger a crawl (admin / refresh); invalidates services + stats on success. */
export function useTriggerCrawl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sources?: string[]) => crawlerApi.trigger(sources),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...govKeys.all, 'services'] });
      qc.invalidateQueries({ queryKey: govKeys.stats() });
    },
  });
}
