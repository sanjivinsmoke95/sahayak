'use client';

import { useEffect } from 'react';
import { useSettingsStore, useWorkspaceStore } from '@/store';

/**
 * Loads the persisted stores from localStorage after the first render.
 *
 * The settings and workspace stores use `skipHydration`, so they start from
 * their server-safe defaults and match the server-rendered markup. This
 * rehydrates them once, on mount, applying the values saved on the device.
 */
export function StoreHydrator() {
  useEffect(() => {
    void useSettingsStore.persist.rehydrate();
    void useWorkspaceStore.persist.rehydrate();
  }, []);

  return null;
}
