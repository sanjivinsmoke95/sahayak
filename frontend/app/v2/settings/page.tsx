'use client';

import { useState } from 'react';
import { Icon } from '@/components/common';
import { Sheet } from '@/components/ui';
import { V2Button, V2Card, V2Input } from '@/components/v2';
import { useClearDocuments, useTranslation, useUpdateSettings } from '@/hooks';
import { LANGS } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store';
import type { LanguageCode, TextSize } from '@/types';

function SettingRow({ icon, title, description, children }: {
  icon: string; title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <V2Card className="p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#E1F0EF] text-[#0C6E6B]">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="v2-heading text-base font-semibold text-[#19120E]">{title}</p>
          {description && <p className="mt-0.5 text-sm text-[#7A6E68]">{description}</p>}
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </V2Card>
  );
}

function OptionChips<T extends string | boolean>({ value, onChange, options, columns = 3 }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string; className?: string }[]; columns?: number;
}) {
  return (
    <div className={`grid gap-2 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-[12px] border px-3 py-2.5 text-sm font-semibold transition',
              opt.className,
              active ? 'border-[#0C6E6B] bg-[#E1F0EF] text-[#0C6E6B]' : 'border-[#D8D0C7] bg-white text-[#19120E]',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function V2SettingsPage() {
  const { t } = useTranslation();
  const settings = useSettingsStore();
  const updateSettings = useUpdateSettings();
  const clearDocuments = useClearDocuments();
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);

  const save = <K extends keyof typeof settings>(key: K, value: unknown) => {
    updateSettings.mutate({ [key]: value } as Record<string, unknown>);
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="v2-heading text-2xl font-bold text-[#19120E]">{t('setTitle')}</h1>
        <p className="mt-1 text-sm text-[#7A6E68]">{t('setSub')}</p>
      </header>

      <SettingRow icon="shrink" title={t('autoShrink')} description={t('autoShrinkS')}>
        <OptionChips<boolean>
          columns={2}
          value={settings.autoShrink}
          onChange={(v) => { settings.setAutoShrink(v); save('autoShrink', v); }}
          options={[
            { value: true, label: t('voiceOn') },
            { value: false, label: t('voiceOff') },
          ]}
        />
      </SettingRow>

      <SettingRow icon="user" title={t('yourName')}>
        <V2Input
          value={settings.displayName}
          placeholder={t('namePh')}
          onChange={(e) => settings.setDisplayName(e.target.value)}
          onBlur={() => save('displayName', settings.displayName)}
        />
      </SettingRow>

      <SettingRow icon="globe" title={t('language')}>
        <OptionChips<LanguageCode>
          value={settings.language}
          onChange={(v) => { settings.setLanguage(v); save('language', v); }}
          options={LANGS.map((l) => ({ value: l.code, label: l.native }))}
        />
      </SettingRow>

      <SettingRow icon="type" title={t('textSize')}>
        <OptionChips<TextSize>
          value={settings.textSize}
          onChange={(v) => { settings.setTextSize(v); save('textSize', v); }}
          options={[
            { value: 'standard', label: t('sizeStd'), className: 'text-sm' },
            { value: 'large', label: t('sizeLg'), className: 'text-base' },
            { value: 'xlarge', label: t('sizeXl'), className: 'text-lg' },
          ]}
        />
      </SettingRow>

      <SettingRow icon="speaker" title={t('voicePref')}>
        <OptionChips<boolean>
          columns={2}
          value={settings.readAloud}
          onChange={(v) => { settings.setReadAloud(v); save('readAloud', v); }}
          options={[
            { value: true, label: t('voiceOn') },
            { value: false, label: t('voiceOff') },
          ]}
        />
      </SettingRow>

      <SettingRow icon="lock" title={t('privacyTitle')} description={t('privacyBody')}>
        <p className="mb-4 text-sm text-[#7A6E68]">{t('storageNote')}</p>
        <V2Button variant="danger" size="md" onClick={() => setDeleteSheetOpen(true)}>
          <Icon name="trash" className="h-5 w-5" />
          {t('deleteAll')}
        </V2Button>
      </SettingRow>

      <p className="text-center text-xs leading-relaxed text-[#7A6E68]">{t('disclaimer')}</p>

      <Sheet open={deleteSheetOpen} onOpenChange={setDeleteSheetOpen} title={t('deleteAll')} closeLabel={t('cancel')}>
        <div className="rounded-[12px] bg-[#FDEEEC] p-4 text-sm leading-relaxed text-[#C0392B]">
          <p className="font-semibold">{t('deleteAllAsk')}</p>
          <p className="mt-1">{t('deleteAllNote')}</p>
        </div>
        <div className="mt-4 space-y-2">
          <V2Button
            full
            size="lg"
            variant="danger"
            disabled={clearDocuments.isPending}
            onClick={() => { clearDocuments.mutate(undefined, { onSuccess: () => setDeleteSheetOpen(false) }); }}
          >
            <Icon name="trash" className="h-5 w-5" />
            {t('deleteAll')}
          </V2Button>
          <V2Button full size="lg" variant="secondary" onClick={() => setDeleteSheetOpen(false)}>
            {t('cancel')}
          </V2Button>
        </div>
      </Sheet>
    </div>
  );
}
