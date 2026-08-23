'use client';

import { Button, Input } from '@/components/ui';
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

  // Every change writes locally first for instant feedback, then syncs.
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
          onClick={() => {
            if (window.confirm(t('deleteAllAsk'))) clearDocuments.mutate();
          }}
        >
          <Icon name="trash" className="h-5 w-5" />
          {t('deleteAll')}
        </Button>
      </SettingsSection>

      <p className="text-base leading-relaxed text-muted">{t('disclaimer')}</p>
      <p className="text-base text-muted">{t('prototypeNote')}</p>
    </div>
  );
}
