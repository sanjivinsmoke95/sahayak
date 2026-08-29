'use client';

import { useRouter } from 'next/navigation';
import { useUiStore } from '@/store';
import { V2Logo } from './V2Logo';
import { V2Ribbon } from './V2Ribbon';

interface V2HeaderProps {
  /** Right-aligned controls (globe, menu, kebab …). */
  children?: React.ReactNode;
  /** Set false on the home page so tapping the logo doesn't self-navigate. */
  linkHome?: boolean;
}

/**
 * The single Sahayak header used on every V2 screen. The supplied logo lockup
 * sits at the left with the tricolour ribbon behind the top-right — identical
 * spacing, padding and flag placement on the home page and every sub-page, so
 * moving between screens never feels like a change. Page-specific controls are
 * passed in as children and align to the right.
 */
export function V2Header({ children, linkHome = true }: V2HeaderProps) {
  const router = useRouter();
  const setDirection = useUiStore((s) => s.setDirection);
  const goHome = () => { setDirection('pop'); router.push('/v2'); };

  return (
    <header
      className="relative shrink-0 overflow-hidden bg-[#FEF9F3] px-3 pb-1"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}
    >
      <V2Ribbon placement="top" />
      <div className="relative flex items-center gap-2 py-2.5">
        {linkHome ? (
          <button
            type="button"
            onClick={goHome}
            aria-label="Sahayak home"
            className="shrink-0 rounded-lg active:opacity-70"
          >
            <V2Logo variant="full" className="h-11 w-auto" />
          </button>
        ) : (
          <V2Logo variant="full" className="h-11 w-auto shrink-0" />
        )}
        <div className="min-w-0 flex-1" />
        {children}
      </div>
    </header>
  );
}
