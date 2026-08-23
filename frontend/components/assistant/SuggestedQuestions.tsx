'use client';

import { useTranslation } from '@/hooks';
import { SUGGESTED } from '@/lib/i18n';

interface SuggestedQuestionsProps {
  onPick: (question: string) => void;
  limit?: number;
}

export function SuggestedQuestions({ onPick, limit = 4 }: SuggestedQuestionsProps) {
  const { t, tr } = useTranslation();

  return (
    <div>
      <p className="mb-2 text-base font-semibold text-muted">{t('tryAsking')}</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED.slice(0, limit).map((question, i) => {
          const label = tr(question);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(label)}
              className="rounded-full border border-navy-200 bg-white px-3.5 py-2 text-sm font-semibold text-navy-700 active:bg-navy-50"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
