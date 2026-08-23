'use client';

import { useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/** Real implementation: reads the Clerk session token. */
function useClerkToken(): () => Promise<string | null> {
  const { getToken } = useAuth();
  return useCallback(async () => {
    try {
      return await getToken();
    } catch {
      return null;
    }
  }, [getToken]);
}

/** Stand-in used when no Clerk keys are configured. */
function useNoToken(): () => Promise<string | null> {
  return useCallback(async () => null, []);
}

/**
 * Returns a getter for the Clerk session token.
 *
 * Which implementation is used is decided once, at module load, from an
 * environment variable that cannot change while the app is running. That
 * keeps the hook order stable across renders while letting the app boot with
 * no auth configured at all — `useAuth` throws outside a ClerkProvider, and
 * providers.tsx only mounts one when a publishable key exists.
 */
export const useAuthToken = clerkEnabled ? useClerkToken : useNoToken;
