'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { V2Card, V2DocumentCard, V2SchemeMatchCard } from '@/components/v2';
import { useDocuments, useSchemeMatches, useTranslation } from '@/hooks';
import { useSettingsStore, useUiStore } from '@/store';
import { daysUntil, isValidIsoDate } from '@/utils/format';

const QUICK_ACTIONS = [
  { icon: 'search', labelKey: 'tabSchemes', href: '/v2/schemes' },
  { icon: 'doc', labelKey: 'shortDocs', href: '/v2/documents' },
  { icon: 'tasks', labelKey: 'tabApps', href: '/v2/applications' },
  { icon: 'chat', labelKey: 'navAsk', href: '/v2/assistant' },
] as const;

export default function V2HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const displayName = useSettingsStore((s) => s.displayName);
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: documents } = useDocuments();
  const { data: matchData } = useSchemeMatches();

  const hour = new Date().getHours();
  const greetKey = hour < 12 ? 'greetMorning' : hour < 17 ? 'greetAfternoon' : 'greetEvening';

  const recent = (documents ?? []).slice(0, 5);
  const matches = matchData?.results?.slice(0, 3) ?? [];
  const go = (path: string) => { setDirection('push'); router.push(path); };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <section>
        <h1 className="v2-heading text-2xl font-bold leading-tight text-[#19120E]">
          {t(greetKey)}{displayName ? `, ${displayName}` : ''}
        </h1>
        <p className="mt-1 text-sm text-[#7A6E68]">{t('homeHelp')}</p>
      </section>

      {/* Upload CTA */}
      <button
        type="button"
        onClick={() => go('/v2/upload')}
        className="flex w-full items-center gap-4 rounded-[20px] bg-[#0C6E6B] p-4 text-left text-white shadow-[0_4px_20px_rgba(12,110,107,0.25)] transition active:translate-y-px"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-white/15">
          <Icon name="upload" className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold leading-tight">{t('btnUpload')}</span>
          <span className="mt-0.5 block text-sm text-white/70">Photo, PDF or scan</span>
        </span>
        <Icon name="right" className="h-5 w-5 shrink-0 text-white/50" />
      </button>

      {/* Your documents — horizontal scroll */}
      {recent.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="v2-heading text-lg font-bold text-[#19120E]">{t('recentDocs')}</h2>
            <button
              type="button"
              onClick={() => go('/v2/documents')}
              className="text-sm font-semibold text-[#0C6E6B]"
            >
              {t('viewAll')}
            </button>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {recent.map((doc) => (
              <V2DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended schemes with progress bars */}
      {matches.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="v2-heading text-lg font-bold text-[#19120E]">{t('schRecommended')}</h2>
            <button
              type="button"
              onClick={() => go('/v2/schemes')}
              className="text-sm font-semibold text-[#0C6E6B]"
            >
              {t('viewAll')}
            </button>
          </div>
          <div className="space-y-2.5">
            {matches.map((m) => (
              <V2SchemeMatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* Quick actions grid */}
      <section>
        <h2 className="v2-heading mb-3 text-lg font-bold text-[#19120E]">{t('helpTitle')}</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.href}
              type="button"
              onClick={() => go(action.href)}
              className="flex flex-col items-center gap-2 rounded-[16px] border border-[#D8D0C7] bg-white p-3 active:bg-[#F6F3EF]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E1F0EF] text-[#0C6E6B]">
                <Icon name={action.icon} className="h-5 w-5" />
              </span>
              <span className="text-center text-xs font-semibold leading-tight text-[#19120E]">
                {t(action.labelKey)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Empty state: help cards if no docs */}
      {(documents ?? []).length === 0 && (
        <section className="space-y-2">
          <h2 className="v2-heading text-lg font-bold text-[#19120E]">{t('helpTitle')}</h2>
          {(['help1', 'help2', 'help3', 'help4'] as const).map((key) => (
            <div key={key} className="flex items-start gap-3 rounded-[16px] border border-[#D8D0C7] bg-white p-3.5">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E1F0EF] text-[#0C6E6B]">
                <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-sm font-bold text-[#19120E]">{t(key)}</p>
                <p className="mt-0.5 text-xs text-[#7A6E68]">{t(`${key}s` as any)}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Footer */}
      <p className="text-center text-xs leading-relaxed text-[#7A6E68]">{t('disclaimer')}</p>
    </div>
  );
}
