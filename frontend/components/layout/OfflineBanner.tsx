'use client';

import { Icon } from '@/components/common';
import { useOnlineStatus, useTranslation } from '@/hooks';

export function OfflineBanner() {
  const offline = useOnlineStatus();
  const { t } = useTranslation();

  if (!offline) return null;

  return (
    <div className="flex items-center gap-2 bg-amberx-50 px-4 py-2 text-base font-medium text-amberx-700">
      <Icon name="offline" className="h-5 w-5 shrink-0" />
      {t('offlineOn')}
    </div>
  );
}
