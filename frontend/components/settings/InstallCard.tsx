'use client';

import { Button, Card } from '@/components/ui';
import { Icon } from '@/components/common';
import { useInstallPrompt, useTranslation } from '@/hooks';

/** Add to home screen, so Sahayak opens like any other app. */
export function InstallCard() {
  const { t } = useTranslation();
  const { canInstall, installed, prompt } = useInstallPrompt();

  if (installed) {
    return (
      <p className="flex items-center gap-2 text-base font-semibold text-leaf-700">
        <Icon name="check" className="h-5 w-5" />
        {t('installed')}
      </p>
    );
  }

  return (
    <Card className="border-navy-200 bg-navy-50/60 p-5">
      <h2 className="flex items-center gap-3 text-xl font-bold">
        <Icon name="phone" className="h-6 w-6 text-navy-600" />
        {t('installTitle')}
      </h2>
      <p className="mt-2 text-base leading-relaxed text-muted">{t('installBody')}</p>
      {canInstall ? (
        <Button full size="md" className="mt-4" onClick={() => void prompt()}>
          <Icon name="save" className="h-5 w-5" />
          {t('installBtn')}
        </Button>
      ) : (
        <p className="mt-3 text-base font-medium text-navy-700">{t('installIos')}</p>
      )}
    </Card>
  );
}
