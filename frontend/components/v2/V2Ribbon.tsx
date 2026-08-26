/* eslint-disable @next/next/no-img-element */

import { cn } from '@/lib/utils';

interface V2RibbonProps {
  /** 'top' hugs the top-right (home header accent); 'bottom' spans the footer. */
  placement?: 'top' | 'bottom';
  className?: string;
}

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
      className={cn(
        'pointer-events-none absolute select-none',
        placement === 'top'
          ? 'right-[-12px] top-[10px] h-[82px] w-[224px] origin-top-right -rotate-[7deg] object-cover object-top '
            + '[mask-image:linear-gradient(to_bottom_right,#000_28%,transparent_88%)] '
            + '[-webkit-mask-image:linear-gradient(to_bottom_right,#000_28%,transparent_88%)]'
          : 'inset-x-0 bottom-0 h-20 w-full object-cover',
        className,
      )}
    />
  );
}
