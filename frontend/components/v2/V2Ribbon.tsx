/* eslint-disable @next/next/no-img-element */

import { cn } from '@/lib/utils';

interface V2RibbonProps {
  /**
   * 'top' hugs the top-right corner, 'bottom' spans the footer, and
   * 'watermark' is a faint full-width wave behind the main content.
   */
  placement?: 'top' | 'bottom' | 'watermark';
  className?: string;
}

const PLACEMENT: Record<NonNullable<V2RibbonProps['placement']>, string> = {
  top: 'right-0 top-0 h-[68px] w-[176px] object-cover object-top',
  bottom: 'inset-x-0 bottom-0 h-20 w-full object-cover',
  watermark: 'inset-x-0 bottom-0 z-0 h-[55%] w-full object-cover object-bottom opacity-[0.06]',
};

/**
 * The Indian tricolour wave supplied in the asset pack. Purely decorative, so
 * it is hidden from assistive tech and never intercepts taps.
 */
export function V2Ribbon({ placement = 'bottom', className }: V2RibbonProps) {
  return (
    <img
      src="/v2-assets/tricolor-wave.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cn('pointer-events-none absolute select-none', PLACEMENT[placement], className)}
    />
  );
}
