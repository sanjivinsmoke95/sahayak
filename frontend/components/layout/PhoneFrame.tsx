'use client';

import type { ReactNode } from 'react';

/**
 * On a phone the app fills the screen edge to edge. On a desktop it is drawn
 * inside a phone-shaped frame, so the layout is never stretched into
 * something it was not designed for.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="device-wrap">
      <div className="device">
        <span className="notch" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
