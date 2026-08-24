'use client';

import { useRouter } from 'next/navigation';
import { V2Badge, V2Card } from '@/components/v2';
import { useTranslation } from '@/hooks';
import { useUiStore } from '@/store';
import type { SchemeMatch } from '@/types';

interface Props {
  match: SchemeMatch;
}

export function V2SchemeMatchCard({ match: m }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const pct = m.total > 0 ? Math.round((m.satisfied / m.total) * 100) : 0;
  const ready = m.satisfied === m.total;

  return (
    <V2Card
      onClick={() => { setDirection('push'); router.push(`/v2/schemes/${m.id}`); }}
      className="p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-base font-bold leading-snug text-[#101828]">{m.name}</p>
        <V2Badge tone={ready ? 'good' : 'teal'}>
          {ready ? t('schDocsReady') : t('schMoreNeeded')}
        </V2Badge>
      </div>
      {m.benefit && (
        <p className="mt-1 line-clamp-2 text-sm text-[#667085]">{m.benefit}</p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EAF1FF]">
          <div
            className="h-full rounded-full bg-[#102D63] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-semibold text-[#667085]">
          {m.satisfied}/{m.total} requirements met
        </span>
        <span className="shrink-0 text-xs font-bold text-[#102D63]">{pct}% match</span>
      </div>
      {m.missingTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {m.missingTags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-[#FFF3E3] px-2 py-0.5 text-xs font-medium text-[#F4A340]">
              {tag}
            </span>
          ))}
        </div>
      )}
    </V2Card>
  );
}
