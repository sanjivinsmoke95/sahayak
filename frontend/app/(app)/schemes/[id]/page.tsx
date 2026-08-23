'use client';

import { useParams } from 'next/navigation';
import { Icon } from '@/components/common';
import { Badge, Skeleton } from '@/components/ui';
import { useScheme, useSchemeMatches, useTranslation } from '@/hooks';
import { TAG_LABEL } from '@/lib/scheme-tags';
import { fill } from '@/utils/format';

export default function SchemeDetailPage() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: scheme, isLoading } = useScheme(params.id);
  const { data: matches } = useSchemeMatches();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (!scheme) {
    return <p className="rounded-xl2 bg-alert-50 p-5 text-lg text-alert-600">{t('notFound')}</p>;
  }

  // Readiness comes from the match layer (documents the reader actually has),
  // not an eligibility guess. Only shown when this scheme was recommended.
  const match = matches?.results.find((m) => m.id === scheme.id);
  const metTags = (match?.matchedTags ?? []).filter((tg) => TAG_LABEL[tg]);
  const needTags = (match?.missingTags ?? []).filter((tg) => TAG_LABEL[tg]);
  const ready = match ? match.satisfied === match.total : false;
  const metNames = metTags.map((tg) => t(TAG_LABEL[tg]));
  const needNames = needTags.map((tg) => t(TAG_LABEL[tg]));

  return (
    <div className="space-y-5">
      <header className="space-y-2.5">
        <h1 className="text-2xl font-bold leading-snug">{scheme.name}</h1>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="navy">{scheme.category}</Badge>
          <Badge tone="grey">{scheme.level === 'Central' ? t('schCentral') : t('schState')}</Badge>
        </div>
      </header>

      {/* Provenance — this is reference data, not verified official data. */}
      <div className="flex items-start gap-2 rounded-xl bg-amberx-50 p-3 text-sm leading-relaxed text-amberx-700">
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t('provSchemeNote')}</span>
      </div>

      {/* Readiness + why this was suggested — only when recommended for this reader. */}
      {match && (
        <section className="rounded-xl2 border border-navy-100 bg-white p-4 shadow-soft">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <span
              className={ready ? 'h-2 w-2 rounded-full bg-leaf-600' : 'h-2 w-2 rounded-full bg-amberx-500'}
            />
            <span className={ready ? 'text-leaf-700' : 'text-amberx-700'}>
              {ready ? t('schDocsReady') : t('schMoreNeeded')}
            </span>
          </p>

          {metTags.length + needTags.length > 0 && (
            <>
              <h2 className="mb-2 mt-3 text-base font-bold">{t('schEligTitle')}</h2>
              <ul className="space-y-1.5">
                {metTags.map((tg) => (
                  <li key={tg} className="flex items-center gap-2 text-base">
                    <Icon name="check" className="h-4 w-4 shrink-0 text-leaf-600" strokeWidth={3} />
                    <span>{t(TAG_LABEL[tg])}</span>
                  </li>
                ))}
                {needTags.map((tg) => (
                  <li key={tg} className="flex items-center gap-2 text-base">
                    <Icon name="alert" className="h-4 w-4 shrink-0 text-amberx-500" />
                    <span className="text-muted">{t(TAG_LABEL[tg])}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-3 rounded-xl bg-navy-50 p-3">
            <p className="text-sm font-bold text-navy-700">{t('schWhyTitle')}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              {metNames.length > 0 ? fill(t('schWhyHave'), { list: metNames.join(', ') }) : t('schWhyNone')}
              {needNames.length > 0 && ` ${fill(t('schWhyNeed'), { list: needNames.join(', ') })}`}
            </p>
          </div>
        </section>
      )}

      {scheme.benefit && (
        <section className="rounded-xl2 border border-navy-100 bg-white p-4 shadow-soft">
          <h2 className="mb-1.5 text-base font-bold">{t('schBenefit')}</h2>
          <p className="text-base leading-relaxed">{scheme.benefit}</p>
        </section>
      )}

      {scheme.summary && (
        <section className="rounded-xl2 border border-navy-100 bg-white p-4 shadow-soft">
          <h2 className="mb-1.5 text-base font-bold">{t('schAbout')}</h2>
          <p className="text-base leading-relaxed text-ink">{scheme.summary}</p>
        </section>
      )}

      {scheme.requiredDocuments.length > 0 && (
        <section className="rounded-xl2 border border-navy-100 bg-white p-4 shadow-soft">
          <h2 className="mb-2 text-base font-bold">{t('schReqDocs')}</h2>
          <ul className="space-y-1.5">
            {scheme.requiredDocuments.map((doc, i) => (
              <li key={i} className="flex items-start gap-2 text-base leading-relaxed">
                <Icon name="doc" className="mt-1 h-4 w-4 shrink-0 text-navy-400" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {scheme.officialUrl && (
        <a
          href={scheme.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-navy-600 px-4 text-base font-semibold text-white"
        >
          <Icon name="globe" className="h-5 w-5" />
          {t('schOfficial')}
        </a>
      )}
    </div>
  );
}
