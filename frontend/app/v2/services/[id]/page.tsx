'use client';

import { useParams, useRouter } from 'next/navigation';
import { ServiceWorkflow } from '@/components/services';
import { V2Button } from '@/components/v2';
import { useTranslation } from '@/hooks';
import { GOV_SERVICES } from '@/lib/data/gov-services';
import { useUiStore } from '@/store';

export default function V2ServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);

  const service = GOV_SERVICES.find((s) => s.id === params.id);

  if (!service) {
    return (
      <div className="space-y-4">
        <p className="rounded-[16px] bg-[#FDEEEC] p-5 text-lg text-[#C0392B]">{t('notFound')}</p>
        <V2Button
          size="md"
          variant="secondary"
          onClick={() => { setDirection('pop'); router.push('/v2/applications'); }}
        >
          {t('back')}
        </V2Button>
      </div>
    );
  }

  return <ServiceWorkflow service={service} />;
}
