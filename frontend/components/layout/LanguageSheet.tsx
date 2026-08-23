'use client';

import { Sheet } from '@/components/ui';
import { useTranslation, useUpdateSettings } from '@/hooks';
import { LANGS } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useSettingsStore, useUiStore } from '@/store';
import { buzz } from '@/utils/format';

export function LanguageSheet() {
  const { t, language } = useTranslation();
  const open = useUiStore((s) => s.languageSheetOpen);
  const setOpen = useUiStore((s) => s.setLanguageSheetOpen);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const updateSettings = useUpdateSettings();

  return (
    <Sheet open={open} onOpenChange={setOpen} title={t('chooseLang')} closeLabel={t('close')}>
      <div className="space-y-2.5">
        {LANGS.map((option) => (
          <button
            key={option.code}
            type="button"
            aria-pressed={language === option.code}
            onClick={() => {
              buzz();
              setLanguage(option.code);
              updateSettings.mutate({ language: option.code });
              setOpen(false);
            }}
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-xl font-semibold transition',
              language === option.code
                ? 'border-navy-600 bg-navy-600 text-white'
                : 'border-navy-200 bg-white text-navy-700',
            )}
          >
            <span>{option.native}</span>
            <span className="text-base opacity-70">{option.label}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
