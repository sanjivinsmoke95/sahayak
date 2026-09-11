'use client';

import { useEffect } from 'react';

export function ServiceWorkerInit() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // In development the caching service worker fights Next's HMR — it serves
    // stale chunks from a previous build, which shows up as phantom hydration
    // mismatches and 404s that a hard reload can't clear. Register only in
    // production; in development, actively unregister any worker left behind by
    // an earlier session and drop its caches so the dev build is authoritative.
    if (process.env.NODE_ENV !== 'production') {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => void reg.unregister());
      });
      if (typeof caches !== 'undefined') {
        void caches.keys().then((keys) => keys.forEach((key) => void caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .catch(() => {/* unsupported browser or blocked — the app works without it */});
  }, []);

  return null;
}
