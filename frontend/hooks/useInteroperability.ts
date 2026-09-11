'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  interoperabilityService,
  type AddressValue,
  type CitizenProfile,
  type ConnectedSystem,
  type GovSystem,
  type SyncBatchRecord,
} from '@/services/interoperability.service';
import { useAuthToken } from './useAuthToken';

const PROFILE_KEY = ['interop', 'profile'] as const;
const SYSTEMS_KEY = ['interop', 'systems'] as const;
const HISTORY_KEY = ['interop', 'history'] as const;

export function useCitizenProfile() {
  const getToken = useAuthToken();
  return useQuery<CitizenProfile>({
    queryKey: PROFILE_KEY,
    queryFn: async () => interoperabilityService.getProfile(await getToken()),
    staleTime: 30_000,
  });
}

export function useConnectedSystems() {
  const getToken = useAuthToken();
  return useQuery<ConnectedSystem[]>({
    queryKey: SYSTEMS_KEY,
    queryFn: async () => interoperabilityService.listSystems(await getToken()),
    staleTime: 15_000,
  });
}

export function useSyncHistory() {
  const getToken = useAuthToken();
  return useQuery<SyncBatchRecord[]>({
    queryKey: HISTORY_KEY,
    queryFn: async () => interoperabilityService.history(await getToken()),
  });
}

function useInvalidateInterop() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    void queryClient.invalidateQueries({ queryKey: SYSTEMS_KEY });
    void queryClient.invalidateQueries({ queryKey: HISTORY_KEY });
  };
}

export function useUpdateAddress() {
  const getToken = useAuthToken();
  const invalidate = useInvalidateInterop();
  return useMutation({
    mutationFn: async (vars: { value: AddressValue; targets: GovSystem[]; consent: boolean }) =>
      interoperabilityService.updateAddress(vars, await getToken()),
    onSuccess: invalidate,
  });
}

export function useUpdatePhone() {
  const getToken = useAuthToken();
  const invalidate = useInvalidateInterop();
  return useMutation({
    mutationFn: async (vars: { value: string; targets: GovSystem[]; consent: boolean }) =>
      interoperabilityService.updatePhone(vars, await getToken()),
    onSuccess: invalidate,
  });
}

export function useRetrySync() {
  const getToken = useAuthToken();
  const invalidate = useInvalidateInterop();
  return useMutation({
    mutationFn: async (batchId: string) =>
      interoperabilityService.retry(batchId, await getToken()),
    onSuccess: invalidate,
  });
}

export function useUpdateIdentity() {
  const getToken = useAuthToken();
  const invalidate = useInvalidateInterop();
  return useMutation({
    mutationFn: async (vars: { fullName?: string; dob?: string }) =>
      interoperabilityService.updateIdentity(vars, await getToken()),
    onSuccess: invalidate,
  });
}

/** Demo control for the partial-failure/retry story. */
export function useSimulateSystem() {
  const getToken = useAuthToken();
  const invalidate = useInvalidateInterop();
  return useMutation({
    mutationFn: async (vars: { system: GovSystem; online: boolean }) =>
      interoperabilityService.simulate(vars.system, vars.online, await getToken()),
    onSuccess: invalidate,
  });
}
