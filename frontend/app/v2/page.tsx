'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { V2Logo } from '@/components/v2';
import { useDocuments, useSchemeMatches, useTranslation, useUpdateSettings } from '@/hooks';
import { LANGS } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useSettingsStore, useUiStore } from '@/store';
import type { LanguageCode } from '@/types';
import { buzz } from '@/utils/format';

/* Colours sampled directly from the reference slide */
const NAVY = '#01226F';
const GREEN_SOFT = '#D3E9D4';
const GREEN_INK = '#3E8E5A';
const PEACH_SOFT = '#FFE3C5';
const ORANGE_INK = '#EA9A3E';
const BLUE_SOFT = '#E7ECFB';
const GREY_SOFT = '#EDEEF1';
const GREY_INK = '#667085';

function daysAgo(iso?: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.round((Date.now() - then) / 86_400_000));
}

// Rotated green/orange/blue tints for icon variety, matching the mockup.
const TINTS = [
  { bg: GREEN_SOFT, ink: GREEN_INK },
  { bg: PEACH_SOFT, ink: ORANGE_INK },
  { bg: BLUE_SOFT, ink: NAVY },
];

const STATUS_PILL: Record<string, { label: string; bg: string; ink: string }> = {
  action: { label: 'Action Needed', bg: GREEN_SOFT, ink: GREEN_INK },
  done: { label: 'Explained', bg: GREEN_SOFT, ink: GREEN_INK },
  info: { label: 'Info', bg: GREY_SOFT, ink: GREY_INK },
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
  const { data: matchData } = useSchemeMatches();

  const recent = (documents ?? []).slice(0, 3);
  const matches = (matchData?.results ?? []).slice(0, 3);
  const go = (path: string) => { setDirection('push'); router.push(path); };
  const pickLanguage = (code: LanguageCode) => {
    buzz();
    setLanguage(code);
    updateSettings.mutate({ language: code });
  };

  const quickTiles = [
    { icon: 'folder', label: 'My Docs', bg: GREEN_SOFT, ink: GREEN_INK, href: '/v2/documents' },
    { icon: 'bell', label: 'Alerts', bg: PEACH_SOFT, ink: ORANGE_INK, href: '/v2/alerts' },
    { icon: 'mic', label: 'Voice Ask', bg: PEACH_SOFT, ink: ORANGE_INK, href: '/v2/voice' },
  ];

  return (
    <div className="min-h-full">
      {/* Inline header (no app bar) */}
      <header
        className="px-4 pb-1 pt-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
      >
        <div className="flex items-center gap-2.5">
          <V2Logo variant="mark" className="h-9 w-9 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="v2-heading text-lg font-extrabold leading-tight text-[#01226F]">Sahayak</p>
            <p className="text-xs text-[#667085]">Your Government Assistant</p>
          </div>
          <button
            type="button"
            onClick={() => go('/v2/profile')}
            aria-label={t('tabProfile')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#01226F] active:bg-black/5"
          >
            <Icon name="menu" className="h-6 w-6" strokeWidth={2.2} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="space-y-5 px-4 pb-6 pt-3">
        {/* Greeting */}
        <section>
          <h1 className="v2-heading text-xl font-bold leading-tight text-[#101828]">
            Namaste{displayName ? `, ${displayName}` : ''} <span aria-hidden="true">👋</span>
          </h1>
          <p className="v2-heading mt-2 text-[26px] font-extrabold leading-snug text-[#101828]">
            Let&apos;s make government documents easy to understand.
          </p>
        </section>

        {/* Search bar */}
        <button
          type="button"
          onClick={() => go('/v2/voice')}
          className="flex w-full items-center gap-3 rounded-full border border-[#ECE4D8] bg-white px-4 py-3.5 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#FBF7F1]"
        >
          <Icon name="search" className="h-5 w-5 shrink-0 text-[#98A2B3]" />
          <span className="flex-1 text-base text-[#98A2B3]">Ask Sahayak anything...</span>
          <Icon name="mic" className="h-5 w-5 shrink-0 text-[#01226F]" />
        </button>

        {/* Language chips */}
        <div className="flex gap-2.5">
          {(['te', 'hi', 'en'] as LanguageCode[]).map((code) => {
            const l = LANGS.find((x) => x.code === code)!;
            const active = language === l.code;
            return (
              <button
                key={code}
                type="button"
                aria-pressed={active}
                onClick={() => pickLanguage(code)}
                className="rounded-full px-5 py-2 text-sm font-semibold transition"
                style={active
                  ? { backgroundColor: GREEN_SOFT, color: GREEN_INK }
                  : { backgroundColor: '#FFFFFF', color: '#101828', boxShadow: 'inset 0 0 0 1px #ECE4D8' }}
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
          className="flex w-full items-center gap-4 rounded-[24px] p-4 text-left text-white shadow-[0_10px_24px_rgba(1,34,111,0.28)] transition active:translate-y-px"
          style={{ backgroundColor: NAVY }}
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

        {/* Recent documents */}
        {recent.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="v2-heading text-lg font-bold text-[#101828]">Recent Documents</h2>
              <button type="button" onClick={() => go('/v2/documents')} className="text-sm font-semibold text-[#01226F]">
                View All
              </button>
            </div>
            <div className="space-y-2.5">
              {recent.map((doc, i) => {
                const ago = daysAgo(doc.received);
                const pill = STATUS_PILL[doc.status] ?? STATUS_PILL.done;
                const tint = TINTS[i % 3];
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => go(`/v2/documents/${doc.id}`)}
                    className="flex w-full items-center gap-3 rounded-[18px] border border-[#F0E9DF] bg-white p-3.5 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#FBF7F1]"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px]" style={{ backgroundColor: tint.bg, color: tint.ink }}>
                      <Icon name="doc" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-[#101828]">{tr(doc.title)}</span>
                      <span className="mt-0.5 block text-xs text-[#667085]">
                        Explained{ago !== null ? ` · ${ago === 0 ? 'today' : `${ago} day${ago === 1 ? '' : 's'} ago`}` : ''}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: pill.bg, color: pill.ink }}>
                      {pill.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Recommended schemes */}
        {matches.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="v2-heading text-lg font-bold text-[#101828]">Recommended for you</h2>
              <button type="button" onClick={() => go('/v2/schemes')} className="text-sm font-semibold text-[#01226F]">
                View All
              </button>
            </div>
            <div className="space-y-2.5">
              {matches.map((m) => {
                const pct = m.total > 0 ? Math.round((m.satisfied / m.total) * 100) : 0;
                const ready = m.total > 0 && m.satisfied === m.total;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => go(`/v2/schemes/${m.id}`)}
                    className="w-full rounded-[18px] border border-[#F0E9DF] bg-white p-4 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#FBF7F1]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 text-[15px] font-bold leading-snug text-[#101828]">{m.name}</p>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={ready
                          ? { backgroundColor: GREEN_SOFT, color: GREEN_INK }
                          : { backgroundColor: PEACH_SOFT, color: ORANGE_INK }}
                      >
                        {ready ? 'Documents ready' : 'More documents needed'}
                      </span>
                    </div>
                    {m.benefit && (
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#667085]">{m.benefit}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#EDE8E0]">
                        <span className="block h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: NAVY }} />
                      </span>
                      <span className="shrink-0 text-xs text-[#667085]">{m.satisfied}/{m.total} met</span>
                      <span className="shrink-0 text-xs font-bold" style={{ color: NAVY }}>{pct}% match</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick tiles — whole box tinted */}
        <div className="grid grid-cols-3 gap-3">
          {quickTiles.map((tile) => (
            <button
              key={tile.label}
              type="button"
              onClick={() => go(tile.href)}
              className="flex flex-col items-center gap-2 rounded-[18px] py-5 shadow-[0_1px_4px_rgba(16,40,99,0.05)] transition active:translate-y-px"
              style={{ backgroundColor: tile.bg }}
            >
              <span style={{ color: tile.ink }}>
                <Icon name={tile.icon} className="h-7 w-7" />
              </span>
              <span className="text-sm font-semibold text-[#101828]">{tile.label}</span>
            </button>
          ))}
        </div>

        <p className="pt-1 text-center text-xs leading-relaxed text-[#667085]">{t('disclaimer')}</p>
      </div>
    </div>
  );
}
