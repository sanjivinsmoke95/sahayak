'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { V2Card, V2DocumentRow } from '@/components/v2';
import { useDocuments, useSchemeMatches, useTranslation } from '@/hooks';
import { useSettingsStore, useUiStore } from '@/store';
import { daysUntil, fill, isValidIsoDate } from '@/utils/format';

export default function V2HomePage() {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const displayName = useSettingsStore((s) => s.displayName);
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: documents } = useDocuments();
  const { data: matchData } = useSchemeMatches();

  const hour = new Date().getHours();
  const greetKey = hour < 12 ? 'greetMorning' : hour < 17 ? 'greetAfternoon' : 'greetEvening';

  const recent = (documents ?? []).slice(0, 3);
  const matches = matchData?.results?.slice(0, 2) ?? [];

  const attention = (documents ?? [])
    .filter((d) => isValidIsoDate(d.deadline))
    .map((d) => ({ doc: d, days: daysUntil(d.deadline as string) }))
    .filter((x) => x.days >= 0 && x.days <= 45)
    .sort((a, b) => a.days - b.days)
    .slice(0, 2);

  const go = (path: string) => { setDirection('push'); router.push(path); };

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <section>
        <h1 className="v2-heading text-2xl font-bold leading-tight text-[#19120E]">
          {t(greetKey)}{displayName ? `, ${displayName}` : ''}
        </h1>
        <p className="mt-1 text-base text-[#7A6E68]">{t('homeHelp')}</p>
      </section>

      {/* Upload CTA */}
      <button
        type="button"
        onClick={() => go('/v2/upload')}
        className="flex w-full items-center gap-4 rounded-[20px] bg-[#0C6E6B] p-4 text-left text-white shadow-[0_4px_20px_rgba(25,18,14,0.10)] transition active:translate-y-px"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[12px] bg-white/15">
          <Icon name="upload" className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold leading-tight">{t('homeUploadTitle')}</span>
          <span className="mt-0.5 block text-sm text-white/70">{t('homeUploadSub')}</span>
        </span>
        <Icon name="right" className="h-5 w-5 shrink-0 text-white/50" />
      </button>

      {/* Needs attention */}
      {attention.length > 0 && (
        <section className="space-y-2">
          <h2 className="v2-heading text-sm font-bold text-[#C97B1A]">{t('attnTitle')}</h2>
          {attention.map(({ doc, days }) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-[16px] border border-[#C97B1A]/20 bg-[#FDF3E1] p-3.5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-white text-[#C97B1A]">
                <Icon name="alert" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#19120E]">{tr(doc.title)}</p>
                <p className="text-sm text-[#C97B1A]">
                  {fill(t('attnExpires'), { name: tr(doc.title), n: days })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => go(`/v2/documents/${doc.id}`)}
                className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#C97B1A] active:bg-[#FDF3E1]"
              >
                {t('attnReview')}
              </button>
            </div>
          ))}
        </section>
      )}

      {/* Recent documents */}
      {recent.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="v2-heading text-lg font-bold text-[#19120E]">{t('recentDocs')}</h2>
            <button
              type="button"
              onClick={() => go('/v2/documents')}
              className="text-sm font-semibold text-[#0C6E6B]"
            >
              {t('viewAll')}
            </button>
          </div>
          <div className="overflow-hidden rounded-[16px] border border-[#D8D0C7] bg-white shadow-[0_1px_4px_rgba(25,18,14,0.06),0_2px_12px_rgba(25,18,14,0.04)]">
            {recent.map((doc, i) => (
              <div key={doc.id} className={i > 0 ? 'border-t border-[#EDE9E3]' : ''}>
                <V2DocumentRow document={doc} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Scheme matches */}
      {matches.length > 0 && (
        <section>
          <h2 className="v2-heading mb-2 text-lg font-bold text-[#19120E]">{t('schRecommended')}</h2>
          <div className="space-y-2">
            {matches.map((m) => (
              <V2Card key={m.id} onClick={() => go(`/v2/schemes/${m.id}`)} className="p-4">
                <p className="text-base font-bold text-[#19120E]">{m.name}</p>
                <p className="mt-1 text-sm text-[#7A6E68]">{m.benefit}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-[#E1F0EF] px-2.5 py-0.5 text-xs font-semibold text-[#0C6E6B]">
                    {m.satisfied} / {m.total} {t('secNeed').toLowerCase()}
                  </span>
                </div>
              </V2Card>
            ))}
          </div>
        </section>
      )}

      {/* Empty state: show quick actions if no docs */}
      {(documents ?? []).length === 0 && (
        <section className="space-y-2">
          <h2 className="v2-heading text-lg font-bold text-[#19120E]">{t('helpTitle')}</h2>
          {(['help1', 'help2', 'help3', 'help4'] as const).map((key) => (
            <div key={key} className="flex items-start gap-3 rounded-[16px] border border-[#D8D0C7] bg-white p-3.5">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E1F0EF] text-[#0C6E6B]">
                <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-base font-semibold text-[#19120E]">{t(key)}</p>
                <p className="mt-0.5 text-sm text-[#7A6E68]">{t(`${key}s` as any)}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Footer disclaimer */}
      <p className="text-center text-xs leading-relaxed text-[#7A6E68]">{t('disclaimer')}</p>
    </div>
  );
}
