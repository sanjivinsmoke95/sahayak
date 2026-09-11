'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useSettingsStore } from '@/store/useSettingsStore';

const STORED_USER_KEY = 'sahayak.last_user_id';

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function getCurrentUserId(): string {
  if (!clerkEnabled) return 'dev-user';
  // In Clerk mode, the user id is embedded in the JWT stored by Clerk.
  // We read it from the Clerk-managed key rather than decoding the token.
  try {
    const raw = localStorage.getItem('__clerk_client_jwt');
    if (!raw) return 'unknown';
    const payload = raw.split('.')[1];
    if (!payload) return 'unknown';
    const decoded = JSON.parse(atob(payload));
    return decoded.sub ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Clears all user-specific in-memory and localStorage state when a different
 * user logs in. This prevents a new user from seeing a previous user's
 * active document, chat history, or profile name in the local store.
 *
 * Documents and identity data are already scoped by user_id on the server,
 * so they never cross-contaminate. This guard covers the local layer only.
 */
export function useSessionGuard() {
  useEffect(() => {
    try {
      const current = getCurrentUserId();
      const previous = localStorage.getItem(STORED_USER_KEY);

      if (previous !== null && previous !== current) {
        // Different user — wipe all client-side user state.
        useChatStore.getState().reset();
        useWorkspaceStore.setState({ activeDocumentId: null, activeModelId: null });
        useSettingsStore.getState().setContact({ displayName: '', email: '', phone: '' });
        // Clear persisted store values too.
        localStorage.removeItem('sahayak.workspace.v1');
      }

      localStorage.setItem(STORED_USER_KEY, current);
    } catch {
      // localStorage blocked (private mode, etc.) — safe to ignore.
    }
  }, []);
}
