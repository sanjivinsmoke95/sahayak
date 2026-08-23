'use client';

import { Icon } from '@/components/common';
import { useAssignDocumentProfile, useProfiles, useTranslation } from '@/hooks';
import { relationshipKey } from '@/lib/relationships';
import type { SahayakDocument } from '@/types';

/**
 * Assign a document to a person. Shown only once the reader has added a family
 * member — otherwise there is nothing to choose between.
 */
export function BelongsTo({ document: doc }: { document: SahayakDocument }) {
  const { t } = useTranslation();
  const { data: profiles } = useProfiles();
  const assign = useAssignDocumentProfile();

  const list = profiles ?? [];
  if (list.length <= 1) return null;

  const selfId = list.find((p) => p.isSelf)?.id ?? '';
  const current = doc.profileId ?? selfId;

  return (
    <div className="flex items-center gap-3 rounded-xl2 border border-navy-100 bg-white p-4 shadow-soft">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
        <Icon name="user" className="h-5 w-5" />
      </span>
      <label className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <span className="text-base font-semibold">{t('famBelongsTo')}</span>
        <select
          value={current}
          onChange={(e) => assign.mutate({ slug: doc.id, profileId: e.target.value })}
          className="min-h-[44px] max-w-[60%] rounded-xl border border-navy-200 bg-white px-3 text-base"
        >
          {list.map((p) => (
            <option key={p.id} value={p.id}>
              {p.isSelf ? t('famSelf') : `${p.name} (${t(relationshipKey(p.relationship))})`}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
