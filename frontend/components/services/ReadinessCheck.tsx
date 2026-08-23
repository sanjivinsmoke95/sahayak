'use client';

import { useState } from 'react';
import { Icon, LoadingState } from '@/components/common';
import { Button, Progress } from '@/components/ui';
import { useReadiness, useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';
import type { CitizenService, RequirementStatus } from '@/types';

const STATUS_TONE: Record<string, string> = {
  ready: 'text-leaf-700',
  almost_ready: 'text-amberx-700',
  needs_confirmation: 'text-amberx-700',
  not_ready: 'text-alert-600',
};

function ReqIcon({ status }: { status: RequirementStatus }) {
  if (status === 'satisfied') {
    return (
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-600 text-white">
        <Icon name="check" className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'expired') {
    return (
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-alert-50 text-alert-600">
        <Icon name="clock" className="h-4 w-4" />
      </span>
    );
  }
  if (status === 'unknown') {
    return (
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amberx-50 text-amberx-700">
        <Icon name="help" className="h-4 w-4" />
      </span>
    );
  }
  return <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 border-navy-200" />;
}

/**
 * The backend readiness engine, on demand. Shows an overall status and a
 * status per requirement (satisfied / missing / expired / confirm), each
 * grounded in the reader's stored documents.
 */
export function ReadinessCheck({ service }: { service: CitizenService }) {
  const { t, tr } = useTranslation();
  const [checked, setChecked] = useState(false);
  const { data, isLoading, isError, refetch } = useReadiness(service.id, checked);

  const statusLabel = (s: string) =>
    s === 'ready'
      ? t('rdReady')
      : s === 'almost_ready'
        ? t('rdAlmost')
        : s === 'needs_confirmation'
          ? t('rdNeeds')
          : t('rdNot');

  const reqLabel = (s: RequirementStatus) =>
    s === 'satisfied'
      ? t('rdSatisfied')
      : s === 'missing'
        ? t('rdMissing')
        : s === 'expired'
          ? t('rdExpired')
          : t('rdConfirm');

  if (!checked) {
    return (
      <Button full size="md" onClick={() => setChecked(true)}>
        <Icon name="check" className="h-5 w-5" />
        {t('rdCheck')}
      </Button>
    );
  }

  if (isError) {
    return (
      <div className="space-y-2 rounded-xl2 border border-amberx-100 bg-amberx-50 p-4">
        <p className="text-base text-amberx-700">{t('errorTitle')}</p>
        <Button size="sm" variant="secondary" onClick={() => refetch()}>
          {t('errorRetry')}
        </Button>
      </div>
    );
  }

  if (isLoading || !data) return <LoadingState rows={2} label={t('rdCheck')} />;

  return (
    <section className="rounded-xl2 border border-navy-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <p className={cn('text-xl font-bold leading-snug', STATUS_TONE[data.status])}>
          {statusLabel(data.status)}
        </p>
        <span className="shrink-0 rounded-full bg-navy-50 px-3 py-1 text-sm font-bold text-navy-700">
          {data.score}%
        </span>
      </div>
      <div className="mt-3">
        <Progress value={data.satisfied} total={data.total} />
        <p className="mt-1 text-sm text-muted">
          {data.satisfied} {t('of')} {data.total} {t('rdReqsSatisfied')}
        </p>
      </div>

      <ul className="mt-4 space-y-2.5">
        {data.requirements.map((r) => {
          const localized = service.documents[r.index] ? tr(service.documents[r.index]) : r.label;
          return (
            <li key={r.index} className="flex items-start gap-3">
              <ReqIcon status={r.status} />
              <span className="min-w-0 flex-1 text-base leading-relaxed">
                {localized}
                <span
                  className={cn(
                    'ml-2 text-sm font-semibold',
                    r.status === 'satisfied' ? 'text-leaf-700' : 'text-muted',
                  )}
                >
                  · {reqLabel(r.status)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
