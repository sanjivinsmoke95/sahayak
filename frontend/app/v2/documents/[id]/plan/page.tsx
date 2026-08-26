'use client';

import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { ServiceRequirement } from '@/components/services';
import { Button, Progress, Skeleton } from '@/components/ui';
import {
  useDocument,
  useDocuments,
  useServiceRequirementUpload,
  useTranslation,
} from '@/hooks';
import { matchRequirement } from '@/lib/requirement-match';
import { useUiStore } from '@/store';

/**
 * The action plan for one document: the papers it needs, each with live
 * provided/missing state matched from My Documents, and an upload that stores
 * a real document and satisfies the requirement.
 */
export default function V2DocumentPlanPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, tr } = useTranslation();
  const id = params.id;

  const { data: document, isLoading } = useDocument(id);
  const { data: allDocuments } = useDocuments();
  const { upload } = useServiceRequirementUpload();
  const setDirection = useUiStore((s) => s.setDirection);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-[18px]" />
        <Skeleton className="h-40 w-full rounded-[18px]" />
      </div>
    );
  }

  if (!document) {
    return <p className="rounded-[16px] bg-[#FDE8EA] p-5 text-lg text-[#E5484D]">{t('notFound')}</p>;
  }

  const others = (allDocuments ?? []).filter((d) => d.id !== document.id);
  const requirements = document.need ?? [];
  const matches = requirements.map((req) => matchRequirement(req.en, others));
  const provided = matches.filter(Boolean).length;
  const total = requirements.length;
  const allDone = total > 0 && provided === total;

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3.5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#EAF1FF] text-[#173A78]">
            <Icon name="tasks" className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h1 className="v2-heading text-2xl font-bold leading-snug text-[#101828]">{t('planTitle')}</h1>
            <p className="mt-0.5 truncate text-base text-[#667085]">{tr(document.title)}</p>
          </div>
        </div>
      </header>

      {total === 0 ? (
        <p className="rounded-[18px] border border-[#EAF1FF] bg-white p-5 text-base text-[#667085] shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
          {t('planNoNeed')}
        </p>
      ) : (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="v2-heading text-lg font-bold text-[#101828]">{t('secNeed')}</h2>
            <span className="text-sm font-semibold text-[#667085]">
              {provided} {t('of')} {total} {t('svcReadyCount')}
            </span>
          </div>
          <Progress value={provided} total={total} />

          {allDone && (
            <p className="mt-3 flex items-center gap-2 rounded-[18px] bg-[#EAF7F0] p-3.5 text-base font-semibold text-[#2FA66A]">
              <Icon name="check" className="h-5 w-5" strokeWidth={2.5} />
              {t('planAllDone')}
            </p>
          )}

          <ul className="mt-3 space-y-2.5">
            {requirements.map((req, index) => (
              <ServiceRequirement
                key={req.en}
                requirement={req}
                matched={matches[index]}
                onUpload={(file) => upload(req.en, file)}
              />
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-2.5 pb-4">
        <Button
          full
          size="md"
          variant="secondary"
          onClick={() => { setDirection('pop'); router.push(`/v2/documents/${document.id}`); }}
        >
          <Icon name="left" className="h-5 w-5" />
          {t('back')}
        </Button>
      </div>
    </div>
  );
}
