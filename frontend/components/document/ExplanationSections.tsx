'use client';

import { SectionCard } from '@/components/common';
import { useTranslation } from '@/hooks';
import type { SahayakDocument } from '@/types';
import { formatDate } from '@/utils/format';

/** What the notice says, in the order a worried person asks it. */
export function ExplanationSections({ document: doc }: { document: SahayakDocument }) {
  const { t, tr, language } = useTranslation();

  return (
    <div className="space-y-4">
      <SectionCard icon="info" title={t('secWhat')}>
        {tr(doc.what)}
      </SectionCard>

      <SectionCard icon="user" title={t('secWhy')}>
        {tr(doc.why)}
      </SectionCard>

      <SectionCard icon="calendar" tone="amber" title={t('secDeadline')}>
        <p className="text-xl font-bold">
          {doc.deadline ? formatDate(doc.deadline, language) : t('noDeadline')}
        </p>
      </SectionCard>

      <SectionCard icon="folder" title={t('secWhere')}>
        {tr(doc.where)}
      </SectionCard>

      <SectionCard icon="alert" tone="alert" title={t('secIfNot')}>
        {tr(doc.ifNot)}
      </SectionCard>
    </div>
  );
}
