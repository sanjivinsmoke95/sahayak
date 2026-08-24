'use client';

import { useState } from 'react';
import { Button, Input, Sheet } from '@/components/ui';
import { Icon } from '@/components/common';
import { InstallCard, OptionGrid, SettingsSection } from '@/components/settings';
import { useClearDocuments, useTranslation, useUpdateSettings } from '@/hooks';
import { LANGS } from '@/lib/i18n';
import { useSettingsStore } from '@/store';
import type { LanguageCode, TextSize } from '@/types';

export default function SettingsPage() {
  const { t } = useTranslation();
  const settings = useSettingsStore();
  const updateSettings = useUpdateSettings();
  const clearDocuments = useClearDocuments();
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);

  const save = <K extends keyof typeof settings>(key: K, value: unknown) => {
    updateSettings.mutate({ [key]: value } as Record<string, unknown>);
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">{t('setTitle')}</h1>
        <p className="mt-2 text-lg text-muted">{t('setSub')}</p>
      </header>

      <InstallCard />

      <SettingsSection icon="shrink" title={t('autoShrink')} description={t('autoShrinkS')}>
        <OptionGrid<boolean>
          columns={2}
          value={settings.autoShrink}
          onChange={(value) => {
            settings.setAutoShrink(value);
            save('autoShrink', value);
          }}
          options={[
            { value: true, label: t('voiceOn') },
            { value: false, label: t('voiceOff') },
          ]}
        />
      </SettingsSection>

      <SettingsSection icon="user" title={t('yourName')}>
        <Input
          value={settings.displayName}
          placeholder={t('namePh')}
          onChange={(e) => settings.setDisplayName(e.target.value)}
          onBlur={() => save('displayName', settings.displayName)}
        />
      </SettingsSection>

      <SettingsSection icon="globe" title={t('language')}>
        <OptionGrid<LanguageCode>
          value={settings.language}
          onChange={(value) => {
            settings.setLanguage(value);
            save('language', value);
          }}
          options={LANGS.map((l) => ({ value: l.code, label: l.native }))}
        />
      </SettingsSection>

      <SettingsSection icon="type" title={t('textSize')}>
        <OptionGrid<TextSize>
          value={settings.textSize}
          onChange={(value) => {
            settings.setTextSize(value);
            save('textSize', value);
          }}
          options={[
            { value: 'standard', label: t('sizeStd'), className: 'text-sm' },
            { value: 'large', label: t('sizeLg'), className: 'text-base' },
            { value: 'xlarge', label: t('sizeXl'), className: 'text-lg' },
          ]}
        />
      </SettingsSection>

      <SettingsSection icon="speaker" title={t('voicePref')}>
        <OptionGrid<boolean>
          columns={2}
          value={settings.readAloud}
          onChange={(value) => {
            settings.setReadAloud(value);
            save('readAloud', value);
          }}
          options={[
            { value: true, label: t('voiceOn') },
            { value: false, label: t('voiceOff') },
          ]}
        />
      </SettingsSection>

      <SettingsSection
        icon="lock"
        iconClassName="text-leaf-600"
        title={t('privacyTitle')}
        description={t('privacyBody')}
      >
        <p className="mb-4 text-base text-muted">{t('storageNote')}</p>
        <Button
          variant="danger"
          size="md"
          onClick={() => setDeleteSheetOpen(true)}
        >
          <Icon name="trash" className="h-5 w-5" />
          {t('deleteAll')}
        </Button>
      </SettingsSection>

      <p className="text-base leading-relaxed text-muted">{t('disclaimer')}</p>

      {/* Confirmation sheet for destructive delete-all action. */}
      <Sheet open={deleteSheetOpen} onOpenChange={setDeleteSheetOpen} title={t('deleteAll')} closeLabel={t('cancel')}>
        <div className="rounded-xl bg-alert-50 p-4 text-sm leading-relaxed text-alert-700">
          <p className="font-semibold">{t('deleteAllAsk')}</p>
          <p className="mt-1 text-alert-600">{t('deleteAllNote')}</p>
        </div>
        <div className="mt-4 space-y-2">
          <Button
            full
            size="lg"
            variant="danger"
            disabled={clearDocuments.isPending}
            onClick={() => {
              clearDocuments.mutate(undefined, { onSuccess: () => setDeleteSheetOpen(false) });
            }}
          >
            <Icon name="trash" className="h-5 w-5" />
            {t('deleteAll')}
          </Button>
          <Button full size="lg" variant="secondary" onClick={() => setDeleteSheetOpen(false)}>
            {t('cancel')}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
