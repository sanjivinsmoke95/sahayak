/* eslint-disable @next/next/no-img-element */

import { cn } from '@/lib/utils';

interface V2RibbonProps {
  /** 'top' hugs the top-right (home header accent); 'bottom' spans the footer. */
  placement?: 'top' | 'bottom';
  className?: string;
}

/**
 * A shallow, light tricolour strip used only at the top of non-home screens.
 * Its pointed end faces left; the cropped right end fades rather than cutting
 * off sharply. It is purely decorative and never intercepts taps.
 */
export function V2Ribbon({ placement = 'bottom', className }: V2RibbonProps) {
  return (
    <img
      src="/v2-assets/soft-tricolor-flag.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cn(
        'pointer-events-none absolute select-none',
        placement === 'top'
          ? 'right-0 top-0 h-[42px] w-[190px] -scale-x-100 object-fill opacity-30 mix-blend-multiply blur-[0.4px] '
            + '[mask-image:linear-gradient(to_right,transparent_0%,#000_18%,#000_100%)] '
            + '[-webkit-mask-image:linear-gradient(to_right,transparent_0%,#000_18%,#000_100%)]'
          : 'inset-x-0 bottom-0 h-20 w-full object-cover',
        className,
      )}
    />
  );
}
