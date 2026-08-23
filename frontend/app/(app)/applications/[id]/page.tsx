'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon, Timeline } from '@/components/common';
import { Badge, Button, Progress, Sheet, Skeleton } from '@/components/ui';
import { useApplication, useTranslation, useUpdateApplicationStatus } from '@/hooks';
import { ADVANCE, STATUS_LABEL, STATUS_TONE } from '@/lib/application-status';
import { GOV_SERVICES } from '@/lib/data/gov-services';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import type { ApplicationStatus, RequirementStatus } from '@/types';
import { fill, formatDate } from '@/utils/format';

const TIMELINE_INDEX: Record<ApplicationStatus, number> = {
  discovered: 0,
  preparing: 0,
  ready: 1,
  submitted: 2,
  under_review: 3,
  additional_information_required: 3,
  approved: 4,
  rejected: 4,
  completed: 4,
};

function ReqIcon({ status }: { status: RequirementStatus }) {
  if (status === 'satisfied')
    return <Icon name="check" className="h-4 w-4 shrink-0 text-leaf-600" strokeWidth={3} />;
  if (status === 'expired' || status === 'missing')
    return <Icon name="alert" className="h-4 w-4 shrink-0 text-amberx-500" />;
  return <Icon name="help" className="h-4 w-4 shrink-0 text-navy-300" />;
}

export default function ApplicationDetailPage() {
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
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (!app) {
    return <p className="rounded-xl2 bg-alert-50 p-5 text-lg text-alert-600">{t('notFound')}</p>;
  }

  const service = GOV_SERVICES.find((s) => s.id === app.serviceId);
  const serviceName = service ? tr(service.title) : app.serviceId;
  const readiness = app.readiness;
  const reqLabel = (index: number, fallback: string) =>
    service?.documents[index] ? tr(service.documents[index]) : fallback;

  const firstMissing = readiness?.requirements.find((r) => r.status !== 'satisfied');
  const steps = [
    t('stPreparing'),
    t('stReady'),
    t('stSubmitted'),
    t('stUnderReview'),
    t('appDecision'),
  ];

  return (
    <div className="space-y-5 pb-4">
      <header className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold leading-snug">{serviceName}</h1>
        <Badge tone={STATUS_TONE[app.status]}>{t(STATUS_LABEL[app.status])}</Badge>
      </header>

      {/* Status + progress. */}
      {readiness && (
        <section className="rounded-xl2 border border-navy-100 bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold">{t('appStatusTitle')}</p>
            <span className="text-sm font-bold text-navy-700">{readiness.score}%</span>
          </div>
          <div className="mt-2">
            <Progress value={readiness.satisfied} total={readiness.total} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {readiness.satisfied} {t('of')} {readiness.total} {t('appReqsReady')}
          </p>
        </section>
      )}

      {/* What you need. */}
      {readiness && readiness.requirements.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-bold">{t('secNeed')}</h2>
          <ul className="overflow-hidden rounded-xl2 border border-navy-100 bg-white shadow-soft">
            {readiness.requirements.map((r) => (
              <li
                key={r.index}
                className="flex items-center gap-2.5 border-b border-navy-50 p-3.5 last:border-0"
              >
                <ReqIcon status={r.status} />
                <span
                  className={cn('flex-1 text-base', r.status === 'satisfied' ? '' : 'text-ink')}
                >
                  {reqLabel(r.index, r.label)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Next step. */}
      <section className="rounded-xl2 border border-navy-100 bg-navy-50 p-4">
        <p className="text-sm font-bold text-navy-600">{t('appNextStep')}</p>
        <p className="mt-1 text-base leading-relaxed">
          {firstMissing
            ? fill(t('appNextUpload'), { name: reqLabel(firstMissing.index, firstMissing.label) })
            : t('appAllReady')}
        </p>
        {service && firstMissing && (
          <Button
            className="mt-3"
            size="md"
            onClick={() => {
              setDirection('push');
              router.push(`/services/${service.id}`);
            }}
          >
            <Icon name="upload" className="h-5 w-5" />
            {t('svcUpload')}
          </Button>
        )}
      </section>

      {/* Update status — behind a controlled sheet so the flow can't be
          advanced by accident, only by a deliberate choice + save. */}
      {ADVANCE[app.status].length > 0 && (
        <section>
          <Button
            full
            size="md"
            variant="secondary"
            onClick={() => {
              setPickedStatus(null);
              setStatusSheetOpen(true);
            }}
          >
            <Icon name="up" className="h-5 w-5" />
            {t('appUpdate')}
          </Button>
        </section>
      )}

      {/* Timeline. */}
      <section>
        <h2 className="mb-3 text-lg font-bold">{t('appTimelineTitle')}</h2>
        <Timeline steps={steps} current={TIMELINE_INDEX[app.status]} />
        {app.submittedAt && (
          <p className="mt-3 text-center text-sm text-muted">
            {t('appSubmittedOn').replace('{date}', formatDate(app.submittedAt.slice(0, 10), language))}
          </p>
        )}
      </section>

      <Button
        full
        size="md"
        variant="secondary"
        onClick={() => {
          setDirection('pop');
          router.push('/applications');
        }}
      >
        <Icon name="left" className="h-5 w-5" />
        {t('back')}
      </Button>

      {/* Controlled status change. */}
      <Sheet
        open={statusSheetOpen}
        onOpenChange={setStatusSheetOpen}
        title={t('appUpdate')}
        closeLabel={t('close')}
      >
        <div className="mb-4 flex items-center justify-between rounded-xl bg-navy-50 px-3.5 py-3">
          <span className="text-sm font-semibold text-muted">{t('appStatusCurrent')}</span>
          <Badge tone={STATUS_TONE[app.status]}>{t(STATUS_LABEL[app.status])}</Badge>
        </div>

        <p className="mb-2 text-sm font-semibold text-muted">{t('appChooseNext')}</p>
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
                  'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3.5 text-left text-base font-semibold transition',
                  selected
                    ? 'border-navy-600 bg-navy-50 text-navy-700'
                    : 'border-navy-200 bg-white text-ink',
                )}
              >
                <span
                  className={cn(
                    'grid h-6 w-6 shrink-0 place-items-center rounded-full border-2',
                    selected ? 'border-navy-600' : 'border-navy-300',
                  )}
                >
                  {selected && <span className="h-3 w-3 rounded-full bg-navy-600" />}
                </span>
                <span className="flex-1">{t(option.labelKey)}</span>
              </button>
            );
          })}
        </div>

        <Button
          full
          size="lg"
          className="mt-5"
          disabled={!pickedStatus || update.isPending}
          onClick={() => {
            if (!pickedStatus) return;
            update.mutate(
              { status: pickedStatus },
              { onSuccess: () => setStatusSheetOpen(false) },
            );
          }}
        >
          <Icon name="check" className="h-5 w-5" strokeWidth={2.6} />
          {t('appSaveStatus')}
        </Button>
      </Sheet>
    </div>
  );
}
