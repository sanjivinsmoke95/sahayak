'use client';

import { Badge } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { daysUntil, urgency } from '@/utils/format';
import { Icon } from './Icon';

/** Turns an ISO deadline into a colour-coded, human phrase. */
export function DeadlineChip({ iso }: { iso: string | null }) {
  const { t } = useTranslation();
  if (!iso) return <Badge tone="grey">{t('noDeadline')}</Badge>;

  const days = daysUntil(iso);
  const level = urgency(days);
  const tone = level === 'red' || level === 'past' ? 'alert' : level === 'amber' ? 'amber' : 'leaf';
  const label =
    days < 0 ? t('passed') : days === 0 ? t('today') : `${days} ${days === 1 ? t('dayLeft') : t('daysLeft')}`;

  return (
    <Badge tone={tone}>
      <Icon name="clock" className="h-4 w-4" strokeWidth={2.2} />
      {label}
    </Badge>
  );
}
