'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useDocuments, useTranslation, useUpdateSettings } from '@/hooks';
import { LANGS } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useSettingsStore, useUiStore } from '@/store';
import type { LanguageCode } from '@/types';
import { buzz } from '@/utils/format';

/** Whole days since an ISO date, clamped at 0. */
function daysAgo(iso?: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.round((Date.now() - then) / 86_400_000));
}

/** Category-tinted document icon, matching the mockup's green/orange/blue mix. */
const DOC_TINT: Record<string, string> = {
  education: 'bg-[#EAF7EF] text-[#2E9B67]',
  scheme: 'bg-[#EAF7EF] text-[#2E9B67]',
  pension: 'bg-[#EAF7EF] text-[#2E9B67]',
  tax: 'bg-[#FFF3E3] text-[#F4A340]',
  property: 'bg-[#FFF3E3] text-[#F4A340]',
  identity: 'bg-[#EAF1FF] text-[#102D63]',
};
const docTint = (cat: string) => DOC_TINT[cat] ?? 'bg-[#EAF1FF] text-[#102D63]';

const STATUS_PILL: Record<string, { label: string; className: string }> = {
  action: { label: 'Action Needed', className: 'bg-[#EAF7EF] text-[#2E9B67]' },
  info: { label: 'Info', className: 'bg-[#EEF2F7] text-[#667085]' },
  done: { label: 'Explained', className: 'bg-[#EAF1FF] text-[#102D63]' },
};

export default function V2HomePage() {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const displayName = useSettingsStore((s) => s.displayName);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const updateSettings = useUpdateSettings();
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: documents } = useDocuments();

  const recent = (documents ?? []).slice(0, 3);
  const go = (path: string) => { setDirection('push'); router.push(path); };
  const pickLanguage = (code: LanguageCode) => {
    buzz();
    setLanguage(code);
    updateSettings.mutate({ language: code });
  };

  const quickTiles = [
    { icon: 'folder', label: 'My Docs', tint: 'bg-[#EAF1FF] text-[#102D63]', href: '/v2/documents' },
    { icon: 'bell', label: 'Alerts', tint: 'bg-[#FFF3E3] text-[#F4A340]', href: '/v2/alerts' },
    { icon: 'mic', label: 'Voice Ask', tint: 'bg-[#FFF3E3] text-[#F4A340]', href: '/v2/voice' },
  ];

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <section>
        <h1 className="v2-heading text-xl font-bold leading-tight text-[#101828]">
          Namaste{displayName ? `, ${displayName}` : ''} <span aria-hidden="true">👋</span>
        </h1>
        <p className="v2-heading mt-2 text-[26px] font-extrabold leading-snug text-[#101828]">
          Let&apos;s make government documents easy to understand.
        </p>
      </section>

      {/* Search bar → assistant */}
      <button
        type="button"
        onClick={() => go('/v2/assistant')}
        className="flex w-full items-center gap-3 rounded-full border border-[#D9E2F0] bg-white px-4 py-3.5 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F8FAFC]"
      >
        <Icon name="search" className="h-5 w-5 shrink-0 text-[#667085]" />
        <span className="flex-1 text-base text-[#667085]">Ask Sahayak anything...</span>
        <Icon name="mic" className="h-5 w-5 shrink-0 text-[#102D63]" />
      </button>

      {/* Language chips — mockup order: Telugu, Hindi, English */}
      <div className="flex gap-2.5">
        {['te', 'hi', 'en'].map((code) => {
          const l = LANGS.find((x) => x.code === code)!;
          const active = language === l.code;
          return (
            <button
              key={l.code}
              type="button"
              aria-pressed={active}
              onClick={() => pickLanguage(l.code)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                active
                  ? 'bg-[#EAF7EF] text-[#2E9B67] ring-1 ring-[#BFE6CF]'
                  : 'bg-white text-[#101828] ring-1 ring-[#D9E2F0]',
              )}
            >
              {l.native}
            </button>
          );
        })}
      </div>

      {/* Upload CTA */}
      <button
        type="button"
        onClick={() => go('/v2/upload')}
        className="flex w-full items-center gap-4 rounded-[24px] bg-[#102D63] p-4 text-left text-white shadow-[0_4px_20px_rgba(16,40,99,0.25)] transition active:translate-y-px"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-white/15">
          <Icon name="upload" className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold leading-tight">Upload a document</span>
          <span className="mt-0.5 block text-sm text-white/70">Photo, PDF or scan</span>
        </span>
        <Icon name="right" className="h-5 w-5 shrink-0 text-white/60" />
      </button>

      {/* Recent documents — vertical list with status pills */}
      {recent.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="v2-heading text-lg font-bold text-[#101828]">Recent Documents</h2>
            <button
              type="button"
              onClick={() => go('/v2/documents')}
              className="text-sm font-semibold text-[#102D63]"
            >
              View All
            </button>
          </div>
          <div className="space-y-2.5">
            {recent.map((doc) => {
              const ago = daysAgo(doc.received);
              const pill = STATUS_PILL[doc.status] ?? STATUS_PILL.done;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => go(`/v2/documents/${doc.id}`)}
                  className="flex w-full items-center gap-3 rounded-[18px] border border-[#E8EDF5] bg-white p-3.5 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F8FAFC]"
                >
                  <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-[12px]', docTint(doc.cat))}>
                    <Icon name="doc" className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold text-[#101828]">{tr(doc.title)}</span>
                    <span className="mt-0.5 block text-xs text-[#667085]">
                      Explained{ago !== null ? ` · ${ago === 0 ? 'today' : `${ago} day${ago === 1 ? '' : 's'} ago`}` : ''}
                    </span>
                  </span>
                  <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold', pill.className)}>
                    {pill.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick tiles */}
      <div className="grid grid-cols-3 gap-3">
        {quickTiles.map((tile) => (
          <button
            key={tile.label}
            type="button"
            onClick={() => go(tile.href)}
            className="flex flex-col items-center gap-2 rounded-[18px] border border-[#E8EDF5] bg-white py-4 shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F8FAFC]"
          >
            <span className={cn('grid h-11 w-11 place-items-center rounded-[14px]', tile.tint)}>
              <Icon name={tile.icon} className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-[#101828]">{tile.label}</span>
          </button>
        ))}
      </div>

      <p className="pt-1 text-center text-xs leading-relaxed text-[#667085]">{t('disclaimer')}</p>
    </div>
  );
}
