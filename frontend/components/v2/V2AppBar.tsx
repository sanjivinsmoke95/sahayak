'use client';

import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { useUiStore } from '@/store';
import { V2Header } from './V2Header';

/**
 * App bar for every standard V2 sub-page. It is just the shared {@link V2Header}
 * (supplied logo lockup + tricolour ribbon, matching the home page exactly) with
 * a language control on the right. The logo doubles as the "up" affordance —
 * tapping it returns home — alongside the bottom tab bar.
 */
export function V2AppBar() {
  const { t } = useTranslation();
  const setLanguageSheetOpen = useUiStore((s) => s.setLanguageSheetOpen);

  return (
    <V2Header>
      <button
        type="button"
        onClick={() => setLanguageSheetOpen(true)}
        aria-label={t('language')}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#173A78] active:bg-[#EAF1FF]"
      >
        <Icon name="globe" className="h-5 w-5" />
      </button>
    </V2Header>
  );
}
