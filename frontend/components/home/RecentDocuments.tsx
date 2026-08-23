'use client';

import { useRouter } from 'next/navigation';
import { DocumentRow } from '@/components/documents';
import { useDocuments, useTranslation } from '@/hooks';
import { useUiStore } from '@/store';

/** The most recent documents as compact rows — same row as the Documents locker. */
export function RecentDocuments() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: documents } = useDocuments();
  const setDirection = useUiStore((s) => s.setDirection);

  const recent = (documents ?? []).slice(0, 3);
  if (recent.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading">
      <div className="mb-2 flex items-center justify-between">
        <h2 id="recent-heading" className="text-lg font-bold">
          {t('recentDocs')}
        </h2>
        <button
          type="button"
          onClick={() => {
            setDirection('push');
            router.push('/documents');
          }}
          className="text-sm font-semibold text-navy-600"
        >
          {t('viewAll')}
        </button>
      </div>

      <ul className="overflow-hidden rounded-xl2 border border-navy-100 bg-white shadow-soft">
        {recent.map((doc, i) => (
          <li key={doc.id} className={i > 0 ? 'border-t border-navy-50' : ''}>
            <DocumentRow document={doc} />
          </li>
        ))}
      </ul>
    </section>
  );
}
