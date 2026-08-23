'use client';

import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';

export function PrivacyNote() {
  const { t } = useTranslation();
  return (
    <section className="flex items-start gap-3.5 rounded-xl2 border border-leaf-100 bg-leaf-50 p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-leaf-600">
        <Icon name="lock" className="h-6 w-6" />
      </span>
      <div>
        <h2 className="text-lg font-bold text-leaf-700">{t('privacyTitle')}</h2>
        <p className="mt-1 text-base leading-relaxed">{t('privacyBody')}</p>
      </div>
    </section>
  );
}
