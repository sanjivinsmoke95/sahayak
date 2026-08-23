'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { documentsService, type AnalyzeRequest } from '@/services';
import type { ChecklistMap, SahayakDocument } from '@/types';
import { useAuthToken } from './useAuthToken';

export function useDocuments() {
  const getToken = useAuthToken();
  return useQuery<SahayakDocument[]>({
    queryKey: QUERY_KEYS.documents,
    queryFn: async () => documentsService.list(await getToken()),
  });
}

export function useDocument(id: string) {
  const getToken = useAuthToken();
  return useQuery<SahayakDocument>({
    queryKey: QUERY_KEYS.document(id),
    queryFn: async () => documentsService.get(id, await getToken()),
    enabled: !!id,
  });
}

export function useChecklists() {
  const getToken = useAuthToken();
  return useQuery<ChecklistMap>({
    queryKey: QUERY_KEYS.checklists,
    queryFn: async () => documentsService.getChecklists(await getToken()),
  });
}

export function useAnalyzeDocument() {
  const getToken = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AnalyzeRequest) =>
      documentsService.analyze(payload, await getToken()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checklists });
    },
  });
}

export function useToggleChecklistItem() {
  const getToken = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      documentId: string;
      kind: 'steps' | 'need';
      index: number;
      done: boolean;
    }) => documentsService.toggleChecklistItem(payload, await getToken()),

    // Ticking a box must feel instant, so the cache is updated before the
    // request lands and rolled back if it fails.
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.checklists });
      const previous = queryClient.getQueryData<ChecklistMap>(QUERY_KEYS.checklists);
      queryClient.setQueryData<ChecklistMap>(QUERY_KEYS.checklists, (old) => {
        const next: ChecklistMap = { ...(old || {}) };
        const current = next[payload.documentId] || { steps: {}, need: {} };
        next[payload.documentId] = {
          ...current,
          [payload.kind]: { ...current[payload.kind], [payload.index]: payload.done },
        };
        return next;
      });
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.checklists, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checklists });
    },
  });
}

export function useDeleteDocument() {
  const getToken = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => documentsService.remove(id, await getToken()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents }),
  });
}

export function useClearDocuments() {
  const getToken = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => documentsService.clearAll(await getToken()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents }),
  });
}
