'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { V2Ribbon } from '@/components/v2';
import { useUpdateSettings } from '@/hooks';
import { LANGS } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useSettingsStore, useUiStore } from '@/store';
import type { LanguageCode } from '@/types';

const ORDER: LanguageCode[] = ['te', 'hi', 'en'];
const GLYPH: Record<LanguageCode, string> = { te: 'తె', hi: 'हि', en: 'En' };

export default function V2LanguagePage() {
  const router = useRouter();
  const current = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const updateSettings = useUpdateSettings();
  const setDirection = useUiStore((s) => s.setDirection);
  const [picked, setPicked] = useState<LanguageCode>(current);

  const cont = () => {
    setLanguage(picked);
    updateSettings.mutate({ language: picked });
    setDirection('pop');
    router.back();
  };

  return (
    <div className="relative flex min-h-full flex-col">
      <p className="mt-1 text-center text-base text-[#667085]">Select your preferred language</p>

      <div className="mt-6 space-y-3">
        {ORDER.map((code) => {
          const l = LANGS.find((x) => x.code === code)!;
          const active = picked === code;
          return (
            <button
              key={code}
              type="button"
              aria-pressed={active}
              onClick={() => setPicked(code)}
              className={cn(
                'flex w-full items-center gap-4 rounded-[18px] border-2 p-4 text-left transition',
                active
                  ? 'border-[#F4A340] bg-[#FFF9F0]'
                  : 'border-[#E8EDF5] bg-white',
              )}
            >
              <span className={cn(
                'grid h-12 w-12 shrink-0 place-items-center rounded-[14px] text-lg font-bold',
                active ? 'bg-[#FFF3E3] text-[#B5760F]' : 'bg-[#EAF1FF] text-[#102D63]',
              )}>
                {GLYPH[code]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold text-[#101828]">{l.native}</span>
                <span className="block text-sm text-[#667085]">{l.label}</span>
              </span>
              <span className={cn(
                'grid h-6 w-6 shrink-0 place-items-center rounded-full border-2',
                active ? 'border-[#102D63] bg-[#102D63]' : 'border-[#D9E2F0]',
              )}>
                {active && <Icon name="check" className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative z-10 mt-auto pb-24 pt-8">
        <button
          type="button"
          onClick={cont}
          className="flex w-full items-center justify-center rounded-[16px] bg-[#102D63] px-4 py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(16,40,99,0.22)] active:translate-y-px"
        >
          Continue
        </button>
      </div>

      <V2Ribbon placement="bottom" className="left-[-1rem] right-[-1rem] z-0 w-auto" />
    </div>
  );
}
