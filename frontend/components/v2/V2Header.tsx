'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { useUiStore } from '@/store';
import { V2Logo } from './V2Logo';
import { V2Ribbon } from './V2Ribbon';

interface V2HeaderProps {
  /** Page-specific controls (globe, kebab …); rendered left of the profile button. */
  children?: React.ReactNode;
  /** Set false on the home page so tapping the logo doesn't self-navigate. */
  linkHome?: boolean;
}

/**
 * The single Sahayak header used on every V2 screen. The supplied logo lockup
 * sits at the left with the tricolour ribbon behind the top-right — identical
 * spacing, padding and flag placement on the home page and every sub-page, so
 * moving between screens never feels like a change. Page-specific controls are
 * passed as children; the profile shortcut is always the right-most control.
 */
export function V2Header({ children, linkHome = true }: V2HeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const goHome = () => { setDirection('pop'); router.push('/v2'); };
  const goProfile = () => { setDirection('push'); router.push('/v2/profile'); };

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
        <button
          type="button"
          onClick={goProfile}
          aria-label={t('tabProfile')}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#173A78] active:bg-[#EAF1FF]"
        >
          <Icon name="menu" className="h-6 w-6" strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}
