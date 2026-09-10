'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { identityService } from '@/services';
import type { IdentityAuditEntry, IdentityKind, IdentityRecord } from '@/types';
import { useAuthToken } from './useAuthToken';

const IDENTITY_KEY = ['identity'] as const;

/** Masked records. Safe to cache — it holds no numbers. */
export function useIdentities() {
  const getToken = useAuthToken();
  return useQuery<IdentityRecord[]>({
    queryKey: IDENTITY_KEY,
    queryFn: async () => identityService.list(await getToken()),
    staleTime: 60_000,
  });
}

export function useSaveIdentity() {
  const getToken = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { kind: IdentityKind; value: string }) =>
      identityService.save(vars.kind, vars.value, await getToken()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: IDENTITY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['identity-audit'] });
    },
  });
}

export function useDeleteIdentity() {
  const getToken = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (kind: IdentityKind) => identityService.remove(kind, await getToken()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: IDENTITY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['identity-audit'] });
    },
  });
}

export function useIdentityAudit() {
  const getToken = useAuthToken();
  return useQuery<IdentityAuditEntry[]>({
    queryKey: ['identity-audit'],
    queryFn: async () => identityService.audit(await getToken()),
  });
}

const AUTO_HIDE_MS = 20_000;

/**
 * Holds a revealed number in component state only, and drops it again shortly
 * after.
 *
 * Deliberately not a React Query cache entry: query caches are inspectable,
 * survive navigation, and are the sort of thing a devtools panel or a future
 * persistence plugin would happily write to disk. A plain ref/state pair that
 * is cleared on unmount keeps the value's lifetime obvious and short.
 */
export function useRevealIdentity() {
  const getToken = useAuthToken();
  const queryClient = useQueryClient();
  const [revealed, setRevealed] = useState<Partial<Record<IdentityKind, string>>>({});
  const timers = useRef<Partial<Record<IdentityKind, ReturnType<typeof setTimeout>>>>({});

  const hide = useCallback((kind: IdentityKind) => {
    clearTimeout(timers.current[kind]);
    delete timers.current[kind];
    setRevealed((current) => {
      const next = { ...current };
      delete next[kind];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
    setRevealed({});
  }, []);

  // Leaving the screen — or backgrounding the tab — must not leave a number
  // sitting on display for whoever looks at the phone next.
  useEffect(() => {
    const onHidden = () => { if (document.visibilityState === 'hidden') clearAll(); };
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      clearAll();
    };
  }, [clearAll]);

  const mutation = useMutation({
    mutationFn: async (kind: IdentityKind) => identityService.reveal(kind, await getToken()),
    onSuccess: (data) => {
      setRevealed((current) => ({ ...current, [data.kind]: data.value }));
      clearTimeout(timers.current[data.kind]);
      timers.current[data.kind] = setTimeout(() => hide(data.kind), AUTO_HIDE_MS);
      // Each reveal is audited server-side; refresh the trail the user can see.
      void queryClient.invalidateQueries({ queryKey: ['identity-audit'] });
    },
  });

  return {
    revealed,
    hide,
    reveal: mutation.mutate,
    pendingKind: mutation.isPending ? mutation.variables : undefined,
    autoHideSeconds: AUTO_HIDE_MS / 1000,
  };
}
