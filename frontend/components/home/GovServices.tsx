'use client';

import { useTranslation } from '@/hooks';
import { GOV_SERVICES } from '@/lib/data/gov-services';
import { ServiceCard } from './ServiceCard';

/** The data-driven directory of common government services. */
export function GovServices() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="services-heading">
      <h2 id="services-heading" className="text-2xl font-bold">
        {t('svcTitle')}
      </h2>
      <p className="mb-4 mt-1.5 text-base text-muted">{t('svcSub')}</p>
      <div className="space-y-2.5">
        {GOV_SERVICES.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}
