'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon, Timeline } from '@/components/common';
import { Sheet, Skeleton } from '@/components/ui';
import { V2Badge, V2Button, V2Card, statusTone } from '@/components/v2';
import { useApplication, useTranslation, useUpdateApplicationStatus } from '@/hooks';
import { ADVANCE, STATUS_LABEL, STATUS_TONE } from '@/lib/application-status';
import { GOV_SERVICES } from '@/lib/data/gov-services';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import type { ApplicationStatus, RequirementStatus } from '@/types';
import { fill, formatDate } from '@/utils/format';

const TIMELINE_INDEX: Record<ApplicationStatus, number> = {
  discovered: 0, preparing: 0, ready: 1, submitted: 2, under_review: 3,
  additional_information_required: 3, approved: 4, rejected: 4, completed: 4,
};

function ReqIcon({ status }: { status: RequirementStatus }) {
  if (status === 'satisfied')
    return <Icon name="check" className="h-4 w-4 shrink-0 text-[#2E9B67]" strokeWidth={3} />;
  if (status === 'expired' || status === 'missing')
    return <Icon name="alert" className="h-4 w-4 shrink-0 text-[#F4A340]" />;
  return <Icon name="help" className="h-4 w-4 shrink-0 text-[#D6DDE8]" />;
}

export default function V2ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, tr, language } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: app, isLoading } = useApplication(params.id);
  const update = useUpdateApplicationStatus(params.id);
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [pickedStatus, setPickedStatus] = useState<ApplicationStatus | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-[16px]" />
        <Skeleton className="h-40 w-full rounded-[16px]" />
      </div>
    );
  }
  if (!app) {
    return <p className="rounded-[16px] bg-[#FDE8EA] p-5 text-lg text-[#DC3545]">{t('notFound')}</p>;
  }

  const service = GOV_SERVICES.find((s) => s.id === app.serviceId);
  const serviceName = service ? tr(service.title) : app.serviceId;
  const readiness = app.readiness;
  const reqLabel = (index: number, fallback: string) =>
    service?.documents[index] ? tr(service.documents[index]) : fallback;

  const firstMissing = readiness?.requirements.find((r) => r.status !== 'satisfied');
  const steps = [t('stPreparing'), t('stReady'), t('stSubmitted'), t('stUnderReview'), t('appDecision')];

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-start justify-between gap-3">
        <h1 className="v2-heading text-2xl font-bold leading-snug text-[#101828]">{serviceName}</h1>
        <V2Badge tone={statusTone(app.status)}>{t(STATUS_LABEL[app.status])}</V2Badge>
      </header>

      {readiness && (
        <div className="rounded-[20px] bg-[#102D63] p-5 text-white shadow-[0_4px_20px_rgba(25,18,14,0.10)]">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold">{t('appStatusTitle')}</p>
            <span className="text-sm font-semibold text-white/60">
              {readiness.satisfied} {t('of')} {readiness.total}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${(readiness.satisfied / readiness.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {readiness && readiness.requirements.length > 0 && (
        <V2Card className="p-4">
          <h2 className="v2-heading mb-2 text-base font-semibold text-[#101828]">{t('secNeed')}</h2>
          <ul className="space-y-2">
            {readiness.requirements.map((r) => (
              <li key={r.index} className="flex items-center gap-2.5">
                <ReqIcon status={r.status} />
                <span className="flex-1 text-sm text-[#101828]">{reqLabel(r.index, r.label)}</span>
              </li>
            ))}
          </ul>
        </V2Card>
      )}

      <div className="rounded-[16px] bg-[#EAF1FF] p-4">
        <p className="text-sm font-bold text-[#102D63]">{t('appNextStep')}</p>
        <p className="mt-1 text-sm leading-relaxed text-[#101828]">
          {firstMissing
            ? fill(t('appNextUpload'), { name: reqLabel(firstMissing.index, firstMissing.label) })
            : t('appAllReady')}
        </p>
        {service && firstMissing && (
          <V2Button
            className="mt-3"
            size="md"
            onClick={() => { setDirection('push'); router.push(`/v2/services/${service.id}`); }}
          >
            <Icon name="upload" className="h-5 w-5" />
            {t('svcUpload')}
          </V2Button>
        )}
      </div>

      {ADVANCE[app.status].length > 0 && (
        <V2Button
          full
          size="md"
          variant="secondary"
          onClick={() => { setPickedStatus(null); setStatusSheetOpen(true); }}
        >
          <Icon name="up" className="h-5 w-5" />
          {t('appUpdate')}
        </V2Button>
      )}

      <section>
        <h2 className="v2-heading mb-3 text-lg font-bold text-[#101828]">{t('appTimelineTitle')}</h2>
        <Timeline steps={steps} current={TIMELINE_INDEX[app.status]} />
        {app.submittedAt && (
          <p className="mt-3 text-center text-sm text-[#667085]">
            {t('appSubmittedOn').replace('{date}', formatDate(app.submittedAt.slice(0, 10), language))}
          </p>
        )}
      </section>

      <Sheet open={statusSheetOpen} onOpenChange={setStatusSheetOpen} title={t('appUpdate')} closeLabel={t('close')}>
        <div className="mb-4 flex items-center justify-between rounded-[12px] bg-[#EAF1FF] px-3.5 py-3">
          <span className="text-sm font-semibold text-[#667085]">{t('appStatusCurrent')}</span>
          <V2Badge tone={statusTone(app.status)}>{t(STATUS_LABEL[app.status])}</V2Badge>
        </div>

        <p className="mb-2 text-sm font-semibold text-[#667085]">{t('appChooseNext')}</p>
        <div className="space-y-2" role="radiogroup" aria-label={t('appChooseNext')}>
          {ADVANCE[app.status].map((option) => {
            const selected = pickedStatus === option.status;
            return (
              <button
                key={option.status}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPickedStatus(option.status as ApplicationStatus)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[12px] border px-3.5 py-3.5 text-left text-sm font-semibold transition',
                  selected
                    ? 'border-[#102D63] bg-[#EAF1FF] text-[#102D63]'
                    : 'border-[#D6DDE8] bg-white text-[#101828]',
                )}
              >
                <span className={cn(
                  'grid h-6 w-6 shrink-0 place-items-center rounded-full border-2',
                  selected ? 'border-[#102D63]' : 'border-[#D6DDE8]',
                )}>
                  {selected && <span className="h-3 w-3 rounded-full bg-[#102D63]" />}
                </span>
                <span className="flex-1">{t(option.labelKey)}</span>
              </button>
            );
          })}
        </div>

        <V2Button
          full
          size="lg"
          className="mt-5"
          disabled={!pickedStatus || update.isPending}
          onClick={() => {
            if (!pickedStatus) return;
            update.mutate({ status: pickedStatus }, { onSuccess: () => setStatusSheetOpen(false) });
          }}
        >
          <Icon name="check" className="h-5 w-5" strokeWidth={2.6} />
          {t('appSaveStatus')}
        </V2Button>
      </Sheet>
    </div>
  );
}
