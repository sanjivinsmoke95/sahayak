'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Skeleton } from '@/components/ui';
import { V2Badge, V2Card, statusTone } from '@/components/v2';
import { useApplications, useTranslation } from '@/hooks';
import { GOV_SERVICES } from '@/lib/data/gov-services';
import { STATUS_LABEL } from '@/lib/application-status';
import { useUiStore } from '@/store';

export default function V2ApplicationsPage() {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: applications, isLoading } = useApplications();

  const apps = applications ?? [];
  const open = (href: string) => { setDirection('push'); router.push(href); };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="v2-heading text-2xl font-bold text-[#101828]">{t('appMyTitle')}</h1>
      </header>

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-[16px]" />
      ) : apps.length > 0 ? (
        <div className="space-y-2.5">
          {apps.map((app) => {
            const service = GOV_SERVICES.find((s) => s.id === app.serviceId);
            return (
              <V2Card key={app.id} onClick={() => open(`/v2/applications/${app.id}`)} className="flex items-center gap-3.5 p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#EAF1FF] text-[#102D63]">
                  <Icon name={service?.icon ?? 'tasks'} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 text-base font-bold leading-snug text-[#101828]">
                  {service ? tr(service.title) : app.serviceId}
                </span>
                <V2Badge tone={statusTone(app.status)}>{t(STATUS_LABEL[app.status])}</V2Badge>
              </V2Card>
            );
          })}
        </div>
      ) : (
        <p className="rounded-[16px] border border-[#D6DDE8] bg-white p-4 text-base text-[#667085]">
          {t('appNoApps')}
        </p>
      )}

      <section aria-labelledby="start-service">
        <h2 id="start-service" className="v2-heading mb-3 text-lg font-bold text-[#101828]">
          {t('appsStartService')}
        </h2>
        <div className="space-y-2.5">
          {GOV_SERVICES.map((service) => (
            <V2Card key={service.id} onClick={() => open(`/v2/services/${service.id}`)} className="flex items-center gap-3.5 p-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#EAF1FF] text-[#102D63]">
                <Icon name={service.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 text-base font-bold leading-snug text-[#101828]">
                {tr(service.title)}
              </span>
              <Icon name="right" className="h-5 w-5 shrink-0 text-[#D6DDE8]" />
            </V2Card>
          ))}
        </div>
      </section>
    </div>
  );
}
