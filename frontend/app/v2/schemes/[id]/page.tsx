'use client';

import { useParams } from 'next/navigation';
import { Icon } from '@/components/common';
import { Skeleton } from '@/components/ui';
import { V2Badge, V2Card } from '@/components/v2';
import { useScheme, useSchemeMatches, useTranslation } from '@/hooks';
import { TAG_LABEL } from '@/lib/scheme-tags';
import { fill } from '@/utils/format';

export default function V2SchemeDetailPage() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: scheme, isLoading } = useScheme(params.id);
  const { data: matches } = useSchemeMatches();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-[16px]" />
        <Skeleton className="h-40 w-full rounded-[16px]" />
      </div>
    );
  }
  if (!scheme) {
    return <p className="rounded-[16px] bg-[#FDE8EA] p-5 text-lg text-[#DC3545]">{t('notFound')}</p>;
  }

  const match = matches?.results.find((m) => m.id === scheme.id);
  const metTags = (match?.matchedTags ?? []).filter((tg) => TAG_LABEL[tg]);
  const needTags = (match?.missingTags ?? []).filter((tg) => TAG_LABEL[tg]);
  const ready = match ? match.satisfied === match.total : false;
  const metNames = metTags.map((tg) => t(TAG_LABEL[tg]));
  const needNames = needTags.map((tg) => t(TAG_LABEL[tg]));

  return (
    <div className="space-y-4 pb-4">
      <header>
        <h1 className="v2-heading text-2xl font-bold leading-snug text-[#101828]">{scheme.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <V2Badge tone="teal">{scheme.category}</V2Badge>
          <V2Badge tone="grey">{scheme.level === 'Central' ? t('schCentral') : t('schState')}</V2Badge>
        </div>
      </header>

      {match && (
        <div className="rounded-[20px] bg-[#102D63] p-5 text-white shadow-[0_4px_20px_rgba(25,18,14,0.10)]">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className={`h-2 w-2 rounded-full ${ready ? 'bg-[#2E9B67]' : 'bg-[#F4A340]'}`} />
            {ready ? t('schDocsReady') : t('schMoreNeeded')}
          </p>

          {metTags.length + needTags.length > 0 && (
            <>
              <h2 className="mb-2 mt-3 text-base font-bold">{t('schEligTitle')}</h2>
              <ul className="space-y-1.5">
                {metTags.map((tg) => (
                  <li key={tg} className="flex items-center gap-2 text-sm">
                    <Icon name="check" className="h-4 w-4 shrink-0 text-white/70" strokeWidth={3} />
                    {t(TAG_LABEL[tg])}
                  </li>
                ))}
                {needTags.map((tg) => (
                  <li key={tg} className="flex items-center gap-2 text-sm text-white/50">
                    <Icon name="alert" className="h-4 w-4 shrink-0" />
                    {t(TAG_LABEL[tg])}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-3 rounded-[12px] bg-white/10 p-3">
            <p className="text-sm font-bold">{t('schWhyTitle')}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/80">
              {metNames.length > 0 ? fill(t('schWhyHave'), { list: metNames.join(', ') }) : t('schWhyNone')}
              {needNames.length > 0 && ` ${fill(t('schWhyNeed'), { list: needNames.join(', ') })}`}
            </p>
          </div>
        </div>
      )}

      {scheme.benefit && (
        <V2Card className="p-4">
          <h2 className="v2-heading text-base font-semibold text-[#101828]">{t('schBenefit')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#101828]">{scheme.benefit}</p>
        </V2Card>
      )}

      {scheme.summary && (
        <V2Card className="p-4">
          <h2 className="v2-heading text-base font-semibold text-[#101828]">{t('schAbout')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#101828]">{scheme.summary}</p>
        </V2Card>
      )}

      {scheme.requiredDocuments.length > 0 && (
        <V2Card className="p-4">
          <h2 className="v2-heading mb-2 text-base font-semibold text-[#101828]">{t('schReqDocs')}</h2>
          <ul className="space-y-1.5">
            {scheme.requiredDocuments.map((doc, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-[#101828]">
                <Icon name="doc" className="mt-0.5 h-4 w-4 shrink-0 text-[#D6DDE8]" />
                {doc}
              </li>
            ))}
          </ul>
        </V2Card>
      )}

      {scheme.officialUrl && (
        <a
          href={scheme.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[16px] border border-[#D6DDE8] bg-white px-4 text-base font-semibold text-[#102D63] active:bg-[#EAF1FF]"
        >
          <Icon name="globe" className="h-5 w-5" />
          {t('schOfficial')}
          <Icon name="right" className="h-4 w-4 text-[#D6DDE8]" />
        </a>
      )}

      <div className="flex items-start gap-2 rounded-[12px] bg-[#EAF1FF] p-3 text-sm leading-relaxed text-[#667085]">
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-[#102D63]" />
        <span>{t('provSchemeNote')}</span>
      </div>
    </div>
  );
}
