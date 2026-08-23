'use client';

import { useEffect, useState } from 'react';

/** Cosmetic status bar, shown only inside the desktop phone frame. */
export function StatusBar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(id);
  }, []);

  const hours = now ? now.getHours() % 12 || 12 : 9;
  const minutes = now ? String(now.getMinutes()).padStart(2, '0') : '41';

  return (
    <div className="fake-status shrink-0 items-center justify-between bg-white px-7 pb-1 pt-2.5 text-[12px] font-semibold text-ink/80">
      <span>
        {hours}:{minutes}
      </span>
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <svg viewBox="0 0 18 12" className="h-3 w-4 fill-current">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 26 12" className="h-3 w-6">
          <rect x="0.6" y="0.6" width="21" height="10.8" rx="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <rect x="2.4" y="2.4" width="15" height="7.2" rx="1.6" className="fill-current" />
          <path d="M23.4 4.2v3.6a2 2 0 0 0 0-3.6z" className="fill-current" />
        </svg>
      </span>
    </div>
  );
}
