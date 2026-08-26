'use client';

/* eslint-disable @next/next/no-img-element */

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Icon } from '@/components/common';
import { useDocuments, useProfiles, useTranslation } from '@/hooks';
import { useSettingsStore, useUiStore } from '@/store';

interface Row {
  icon: string;
  label: string;
  onClick: () => void;
  value?: string;
  danger?: boolean;
}

export default function V2ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const displayName = useSettingsStore((s) => s.displayName);
  const email = useSettingsStore((s) => s.email);
  const language = useSettingsStore((s) => s.language);
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: documents } = useDocuments();
  const { data: profiles } = useProfiles();

  const go = (path: string) => { setDirection('push'); router.push(path); };
  const docCount = (documents ?? []).length;
  const famCount = (profiles ?? []).length;

  const services: Row[] = [
    { icon: 'folder', label: t('navDocs'), value: String(docCount), onClick: () => go('/v2/documents') },
    { icon: 'user', label: t('famTitle'), value: famCount ? String(famCount) : undefined, onClick: () => go('/v2/profiles') },
    { icon: 'search', label: t('schemesForMe'), onClick: () => go('/v2/schemes') },
    { icon: 'spark', label: t('discoverServices'), onClick: () => go('/v2/discover') },
    { icon: 'tasks', label: t('appMyTitle'), onClick: () => go('/v2/applications') },
    { icon: 'scan', label: t('msTitle'), onClick: () => go('/v2/mee-seva') },
    { icon: 'shrink', label: t('compressFile'), onClick: () => go('/v2/shrink') },
    { icon: 'chat', label: t('navAsk'), onClick: () => go('/v2/assistant') },
  ];

  const account: Row[] = [
    { icon: 'globe', label: t('language'), value: language.toUpperCase(), onClick: () => go('/v2/language') },
    { icon: 'help', label: t('helpSupport'), onClick: () => go('/v2/assistant') },
    { icon: 'info', label: t('aboutSahayak'), onClick: () => go('/v2/settings') },
    { icon: 'star', label: t('rateUs'), onClick: () => toast(t('rateThanks')) },
    { icon: 'logout', label: t('logout'), danger: true, onClick: () => toast(t('logoutNote')) },
  ];

  const List = ({ rows }: { rows: Row[] }) => (
    <div className="overflow-hidden rounded-[20px] border border-[#E8EDF5] bg-white shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
      {rows.map((row, i) => (
        <button
          key={row.label}
          type="button"
          onClick={row.onClick}
          className={`flex w-full items-center gap-4 px-5 py-4 text-left active:bg-[#F8FAFC] ${i > 0 ? 'border-t border-[#EEF2F7]' : ''}`}
        >
          <Icon
            name={row.icon}
            className={`h-[22px] w-[22px] shrink-0 ${row.danger ? 'text-[#DC3545]' : 'text-[#102D63]'}`}
            strokeWidth={2}
          />
          <span className={`flex-1 text-base font-semibold ${row.danger ? 'text-[#DC3545]' : 'text-[#101828]'}`}>
            {row.label}
          </span>
          {row.value && <span className="text-sm font-semibold text-[#667085]">{row.value}</span>}
          {!row.danger && <Icon name="right" className="h-5 w-5 shrink-0 text-[#D6DDE8]" />}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <button
        type="button"
        onClick={() => go('/v2/signup')}
        className="flex w-full items-center gap-4 rounded-[20px] border border-[#E8EDF5] bg-white p-5 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F8FAFC]"
      >
        <img
          src="/v2-assets/avatar-user.jpg"
          alt=""
          className="h-16 w-16 shrink-0 rounded-full object-cover"
          draggable={false}
          onError={(e) => { e.currentTarget.src = '/v2-assets/avatar-default.svg'; }}
        />
        <div className="min-w-0 flex-1">
          <p className="v2-heading truncate text-xl font-extrabold text-[#101828]">
            {displayName || t('profileWelcome')}
          </p>
          <p className="mt-0.5 truncate text-sm text-[#667085]">
            {email || t('profileComplete')}
          </p>
        </div>
        <Icon name="right" className="h-5 w-5 shrink-0 text-[#D6DDE8]" />
      </button>

      <List rows={services} />
      <List rows={account} />

      <p className="text-center text-xs leading-relaxed text-[#667085]">{t('disclaimer')}</p>
    </div>
  );
}
