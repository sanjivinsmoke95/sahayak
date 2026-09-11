'use client';

import { useEffect } from 'react';

export function ServiceWorkerInit() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {/* silently ignore in dev or unsupported browsers */});
    }
  }, []);

  return null;
}
