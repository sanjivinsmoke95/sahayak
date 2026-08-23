'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Badge, Skeleton } from '@/components/ui';
import { useApplications, useTranslation } from '@/hooks';
import { GOV_SERVICES } from '@/lib/data/gov-services';
import { STATUS_LABEL, STATUS_TONE } from '@/lib/application-status';
import { useUiStore } from '@/store';

/** Applications in progress, plus services the reader can start. */
export default function ApplicationsPage() {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: applications, isLoading } = useApplications();

  const apps = applications ?? [];
  const open = (href: string) => {
    setDirection('push');
    router.push(href);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{t('appMyTitle')}</h1>
      </header>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : apps.length > 0 ? (
        <div className="space-y-2.5">
          {apps.map((app) => {
            const service = GOV_SERVICES.find((s) => s.id === app.serviceId);
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => open(`/applications/${app.id}`)}
                className="flex w-full items-center gap-3.5 rounded-xl2 border border-navy-100 bg-white p-4 text-left shadow-soft active:bg-navy-50"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-navy-50 text-navy-600">
                  <Icon name={service?.icon ?? 'tasks'} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 text-base font-bold leading-snug">
                  {service ? tr(service.title) : app.serviceId}
                </span>
                <Badge tone={STATUS_TONE[app.status]}>{t(STATUS_LABEL[app.status])}</Badge>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl2 border border-navy-100 bg-white p-4 text-base text-muted shadow-soft">
          {t('appNoApps')}
        </p>
      )}

      {/* Start a government service. */}
      <section aria-labelledby="start-service">
        <h2 id="start-service" className="mb-3 text-lg font-bold">
          {t('appsStartService')}
        </h2>
        <div className="space-y-2.5">
          {GOV_SERVICES.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => open(`/services/${service.id}`)}
              className="flex w-full items-center gap-3.5 rounded-xl2 border border-navy-100 bg-white p-3.5 text-left shadow-soft active:bg-navy-50"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-navy-50 text-navy-600">
                <Icon name={service.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 text-base font-bold leading-snug">
                {tr(service.title)}
              </span>
              <Icon name="right" className="h-5 w-5 shrink-0 text-navy-300" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
