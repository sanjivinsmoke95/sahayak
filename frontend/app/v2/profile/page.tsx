'use client';

/* eslint-disable @next/next/no-img-element */

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useDocuments, useProfiles, useTranslation } from '@/hooks';
import { fill } from '@/utils/format';
import { useSettingsStore, useUiStore } from '@/store';
import type { StringKey } from '@/lib/i18n';

interface Row {
  icon: string;
  labelKey: StringKey;
  onClick: () => void;
  badge?: string;
}

export default function V2ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const displayName = useSettingsStore((s) => s.displayName);
  const language = useSettingsStore((s) => s.language);
  const setDirection = useUiStore((s) => s.setDirection);
  const setLanguageSheetOpen = useUiStore((s) => s.setLanguageSheetOpen);
  const { data: documents } = useDocuments();
  const { data: profiles } = useProfiles();

  const go = (path: string) => { setDirection('push'); router.push(path); };
  const docCount = (documents ?? []).length;
  const famCount = (profiles ?? []).length;
  const langLabel = language.toUpperCase();

  const sections: { titleKey: StringKey; rows: Row[] }[] = [
    {
      titleKey: 'profileSection1',
      rows: [
        { icon: 'folder', labelKey: 'profileMyDocs', onClick: () => go('/v2/documents'), badge: String(docCount) },
        { icon: 'user', labelKey: 'profileFamily', onClick: () => go('/v2/profiles'), badge: famCount ? String(famCount) : undefined },
      ],
    },
    {
      titleKey: 'profileSection2',
      rows: [
        { icon: 'search', labelKey: 'profileSchemes', onClick: () => go('/v2/schemes') },
        { icon: 'tasks', labelKey: 'profileApps', onClick: () => go('/v2/applications') },
        { icon: 'chat', labelKey: 'profileAssistant', onClick: () => go('/v2/assistant') },
      ],
    },
    {
      titleKey: 'profileSection3',
      rows: [
        { icon: 'globe', labelKey: 'profileLanguage', onClick: () => setLanguageSheetOpen(true), badge: langLabel },
        { icon: 'settings', labelKey: 'profileSettings', onClick: () => go('/v2/settings') },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile header card */}
      <button
        type="button"
        onClick={() => go('/v2/settings')}
        className="flex w-full items-center gap-4 rounded-[20px] border border-[#E8EDF5] bg-white p-5 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F8FAFC]"
      >
        <img
          src="/v2-assets/avatar-default.svg"
          alt=""
          className="h-16 w-16 shrink-0 rounded-full"
          draggable={false}
        />
        <div className="min-w-0 flex-1">
          <p className="v2-heading truncate text-xl font-extrabold text-[#101828]">
            {displayName || t('profileGuest')}
          </p>
          <p className="mt-0.5 text-sm text-[#667085]">
            {displayName
              ? fill(t('profileDocsCount'), { n: docCount })
              : t('profileSetName')}
          </p>
        </div>
        <Icon name="right" className="h-5 w-5 shrink-0 text-[#D6DDE8]" />
      </button>

      {sections.map((section) => (
        <section key={section.titleKey}>
          <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-[#667085]">
            {t(section.titleKey)}
          </h2>
          <div className="overflow-hidden rounded-[18px] border border-[#E8EDF5] bg-white shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
            {section.rows.map((row, i) => (
              <button
                key={row.labelKey}
                type="button"
                onClick={row.onClick}
                className={`flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-[#F8FAFC] ${i > 0 ? 'border-t border-[#EAF1FF]' : ''}`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#EAF1FF] text-[#102D63]">
                  <Icon name={row.icon} className="h-5 w-5" />
                </span>
                <span className="flex-1 text-base font-semibold text-[#101828]">{t(row.labelKey)}</span>
                {row.badge && (
                  <span className="rounded-full bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-bold text-[#667085]">
                    {row.badge}
                  </span>
                )}
                <Icon name="right" className="h-5 w-5 shrink-0 text-[#D6DDE8]" />
              </button>
            ))}
          </div>
        </section>
      ))}

      <p className="text-center text-xs leading-relaxed text-[#667085]">{t('disclaimer')}</p>
    </div>
  );
}
