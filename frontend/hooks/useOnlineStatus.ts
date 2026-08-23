'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/store';

export function useOnlineStatus() {
  const offline = useUiStore((s) => s.offline);
  const setOffline = useUiStore((s) => s.setOffline);

  useEffect(() => {
    setOffline(navigator.onLine === false);
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [setOffline]);

  return offline;
}
