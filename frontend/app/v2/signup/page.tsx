'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { V2Button, V2Input, V2Logo } from '@/components/v2';
import { useTranslation, useUpdateSettings } from '@/hooks';
import { useSettingsStore, useUiStore } from '@/store';

export default function V2SignupPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const store = useSettingsStore();
  const setContact = useSettingsStore((s) => s.setContact);
  const updateSettings = useUpdateSettings();
  const setDirection = useUiStore((s) => s.setDirection);

  const [name, setName] = useState(store.displayName);
  const [email, setEmail] = useState(store.email);
  const [phone, setPhone] = useState(store.phone);

  const save = () => {
    const displayName = name.trim();
    setContact({ displayName, email: email.trim(), phone: phone.trim() });
    if (displayName) updateSettings.mutate({ displayName });
    setDirection('pop');
    router.push('/v2/profile');
  };

  return (
    <div className="flex min-h-full flex-col px-1 pt-2">
      <div className="flex flex-col items-center text-center">
        <V2Logo variant="full" className="h-16 w-auto" />
        <h1 className="v2-heading mt-5 text-2xl font-extrabold text-[#101828]">{t('signupTitle')}</h1>
        <p className="mt-2 max-w-[18rem] text-base leading-relaxed text-[#667085]">{t('signupSub')}</p>
      </div>

      <div className="mt-7 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-[#101828]">{t('fieldName')}</span>
          <V2Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('namePh')} autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-[#101828]">{t('fieldEmail')}</span>
          <V2Input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-[#101828]">{t('fieldPhone')}</span>
          <V2Input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" />
        </label>
      </div>

      <div className="mt-auto space-y-2.5 pb-2 pt-8">
        <V2Button full size="lg" onClick={save}>
          <Icon name="check" className="h-5 w-5" strokeWidth={2.6} />
          {t('signupSave')}
        </V2Button>
        <V2Button full size="lg" variant="ghost" onClick={() => { setDirection('pop'); router.push('/v2'); }}>
          {t('signupSkip')}
        </V2Button>
      </div>

      <p className="pb-4 text-center text-xs leading-relaxed text-[#667085]">{t('storageNote')}</p>
    </div>
  );
}
