'use client';

import { useRouter } from 'next/navigation';
import { Button, Progress } from '@/components/ui';
import { Icon } from '@/components/common';
import {
  useCreateApplication,
  useDocuments,
  useServiceRequirementUpload,
  useTranslation,
} from '@/hooks';
import { matchRequirement } from '@/lib/requirement-match';
import { useUiStore } from '@/store';
import type { CitizenService } from '@/types';
import { ReadinessCheck } from './ReadinessCheck';
import { ServiceRequirement } from './ServiceRequirement';

/**
 * A government service as a workflow: the required documents with live
 * provided/missing state (matched from My Documents, or uploaded into the
 * slot), the steps to apply, and a route to the nearest Mee Seva centre.
 */
export function ServiceWorkflow({ service }: { service: CitizenService }) {
  const { t, tr } = useTranslation();
  const router = useRouter();
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: documents } = useDocuments();
  const { upload } = useServiceRequirementUpload();
  const createApplication = useCreateApplication();

  const startApplication = () => {
    createApplication.mutate(service.id, {
      onSuccess: (app) => {
        setDirection('push');
        router.push(`/applications/${app.id}`);
      },
    });
  };

  const docs = documents ?? [];
  const matches = service.documents.map((req) => matchRequirement(req.en, docs));
  const provided = matches.filter(Boolean).length;

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3.5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy-50 text-navy-600">
            <Icon name={service.icon} className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-bold leading-snug">{tr(service.title)}</h1>
        </div>
        <p className="mt-3 text-lg leading-relaxed text-muted">{tr(service.forWhom)}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amberx-50 px-2.5 py-1 text-xs font-semibold text-amberx-700">
          <Icon name="info" className="h-3.5 w-3.5" />
          {t('provReference')}
        </div>
      </header>

      {service.deadline && (
        <div className="flex items-start gap-2.5 rounded-xl2 bg-amberx-50 p-4 text-amberx-700">
          <Icon name="calendar" className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-base leading-relaxed">{tr(service.deadline)}</p>
        </div>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('svcDocs')}</h2>
          <span className="text-sm font-semibold text-muted">
            {provided} {t('of')} {service.documents.length} {t('svcReadyCount')}
          </span>
        </div>
        <Progress value={provided} total={service.documents.length} />
        <ul className="mt-3 space-y-2.5">
          {service.documents.map((req, index) => (
            <ServiceRequirement
              key={req.en}
              requirement={req}
              matched={matches[index]}
              onUpload={(file) => upload(req.en, file)}
            />
          ))}
        </ul>
      </section>

      <ReadinessCheck service={service} />

      <section>
        <h2 className="mb-3 text-xl font-bold">{t('svcSteps')}</h2>
        <ol className="space-y-2">
          {service.steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3 rounded-xl2 border border-navy-100 bg-white p-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy-100 text-xs font-bold text-navy-700">
                {index + 1}
              </span>
              <span className="text-base leading-relaxed">{tr(step)}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="space-y-2.5 pb-4">
        <Button full size="md" disabled={createApplication.isPending} onClick={startApplication}>
          <Icon name="tasks" className="h-5 w-5" />
          {t('appStart')}
        </Button>
        <div className="rounded-xl2 bg-navy-50 p-3 text-sm leading-relaxed text-muted">
          {tr(service.where)} {t('svcConfirm')}
        </div>
        {service.meeSeva && (
          <Button
            full
            size="md"
            variant="secondary"
            onClick={() => {
              setDirection('push');
              router.push(`/mee-seva?service=${service.id}`);
            }}
          >
            <Icon name="scan" className="h-5 w-5" />
            {t('meeFindForDoc')}
          </Button>
        )}
      </div>
    </div>
  );
}
