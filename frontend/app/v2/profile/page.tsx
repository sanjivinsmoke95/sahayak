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
  const language = useSettingsStore((s) => s.language);
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: documents } = useDocuments();
  const { data: profiles } = useProfiles();

  const go = (path: string) => { setDirection('push'); router.push(path); };
  const docCount = (documents ?? []).length;
  const famCount = (profiles ?? []).length;

  const services: Row[] = [
    { icon: 'folder', label: 'My documents', value: String(docCount), onClick: () => go('/v2/documents') },
    { icon: 'user', label: 'Family profiles', value: famCount ? String(famCount) : undefined, onClick: () => go('/v2/profiles') },
    { icon: 'search', label: 'Schemes for me', onClick: () => go('/v2/schemes') },
    { icon: 'tasks', label: 'My applications', onClick: () => go('/v2/applications') },
    { icon: 'scan', label: 'Nearby Mee Seva', onClick: () => go('/v2/mee-seva') },
    { icon: 'chat', label: 'Ask Sahayak', onClick: () => go('/v2/assistant') },
  ];

  const account: Row[] = [
    { icon: 'globe', label: 'Language', value: language.toUpperCase(), onClick: () => go('/v2/language') },
    { icon: 'help', label: 'Help & Support', onClick: () => go('/v2/assistant') },
    { icon: 'info', label: 'About Sahayak', onClick: () => go('/v2/settings') },
    { icon: 'star', label: 'Rate Us', onClick: () => toast('Thanks for using Sahayak!') },
    { icon: 'logout', label: 'Logout', danger: true, onClick: () => toast("You're signed in privately on this device.") },
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
        onClick={() => go('/v2/settings')}
        className="flex w-full items-center gap-4 rounded-[20px] border border-[#E8EDF5] bg-white p-5 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F8FAFC]"
      >
        <img src="/v2-assets/avatar-default.svg" alt="" className="h-16 w-16 shrink-0 rounded-full" draggable={false} />
        <div className="min-w-0 flex-1">
          <p className="v2-heading truncate text-xl font-extrabold text-[#101828]">
            {displayName || 'Welcome'}
          </p>
          <p className="mt-0.5 text-sm text-[#667085]">
            {displayName ? 'View and edit your profile' : 'Tap to add your name'}
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
