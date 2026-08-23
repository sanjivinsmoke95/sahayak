'use client';

import { useParams, useRouter } from 'next/navigation';
import { ServiceWorkflow } from '@/components/services';
import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { GOV_SERVICES } from '@/lib/data/gov-services';
import { useUiStore } from '@/store';

export default function ServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);

  const service = GOV_SERVICES.find((s) => s.id === params.id);

  if (!service) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl2 bg-alert-50 p-5 text-lg text-alert-600">{t('notFound')}</p>
        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            setDirection('pop');
            router.push('/actions');
          }}
        >
          {t('back')}
        </Button>
      </div>
    );
  }

  return <ServiceWorkflow service={service} />;
}
