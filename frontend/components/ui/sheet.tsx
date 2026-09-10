'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A bottom sheet — the phone equivalent of a dialog. It rises from the bottom
 * edge so it stays inside thumb reach, and it is anchored to the phone frame
 * rather than the browser viewport.
 */
interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  closeLabel?: string;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, title, closeLabel = 'Close', children }: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="sheet-overlay absolute inset-0 z-50 bg-ink/45" />

        <DialogPrimitive.Content
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          className={cn(
            'sheet-panel absolute inset-x-0 bottom-0 z-50 flex max-h-[86%] flex-col',
            'rounded-t-3xl bg-white shadow-lift',
          )}
        >
          <div className="grid place-items-center pb-1 pt-3">
            <span className="h-1.5 w-11 rounded-full bg-navy-100" />
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3">
            <DialogPrimitive.Title className="text-xl font-bold">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label={closeLabel}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-50 text-muted"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <div className="app-scroll overflow-y-auto px-5 pb-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
