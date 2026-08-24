'use client';

import { useState } from 'react';
import { Icon } from '@/components/common';
import { Sheet } from '@/components/ui';
import { V2Button, V2Card, V2Input } from '@/components/v2';
import { useCreateProfile, useDeleteProfile, useProfiles, useTranslation } from '@/hooks';
import { RELATIONSHIPS, relationshipKey } from '@/lib/relationships';
import { cn } from '@/lib/utils';

export default function V2ProfilesPage() {
  const { t } = useTranslation();
  const { data: profiles } = useProfiles();
  const create = useCreateProfile();
  const remove = useDeleteProfile();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('mother');
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);

  const add = () => {
    if (!name.trim()) return;
    create.mutate(
      { name: name.trim(), relationship },
      { onSuccess: () => { setName(''); setAddOpen(false); } },
    );
  };

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="v2-heading text-2xl font-bold text-[#19120E]">{t('famTitle')}</h1>
          <p className="mt-1 text-sm leading-relaxed text-[#7A6E68]">{t('famSub')}</p>
        </div>
        <V2Button size="sm" variant="secondary" onClick={() => setAddOpen(true)}>
          <Icon name="plus" className="h-4 w-4" />
          {t('famAdd')}
        </V2Button>
      </header>

      <div className="space-y-2.5">
        {(profiles ?? []).map((p) => (
          <V2Card key={p.id} className="flex items-center gap-3 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#E1F0EF] text-[#0C6E6B]">
              <Icon name="user" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-snug text-[#19120E]">{p.name}</p>
              <p className="text-sm text-[#7A6E68]">
                {p.isSelf ? t('famSelf') : t(relationshipKey(p.relationship))}
              </p>
            </div>
            {!p.isSelf && (
              <button
                type="button"
                onClick={() => setRemoveTarget({ id: p.id, name: p.name })}
                className="shrink-0 rounded-[8px] px-3 py-2 text-sm font-semibold text-[#C0392B] active:bg-[#FDEEEC]"
              >
                {t('famRemove')}
              </button>
            )}
          </V2Card>
        ))}
      </div>

      <Sheet open={addOpen} onOpenChange={setAddOpen} title={t('famAdd')} closeLabel={t('cancel')}>
        <div className="space-y-3">
          <V2Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('famName')}
            aria-label={t('famName')}
          />
          <div>
            <p className="mb-2 text-sm font-semibold text-[#7A6E68]">{t('famRelationship')}</p>
            <div className="grid grid-cols-2 gap-2">
              {RELATIONSHIPS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  aria-pressed={relationship === r.value}
                  onClick={() => setRelationship(r.value)}
                  className={cn(
                    'rounded-[12px] border px-3 py-2.5 text-sm font-semibold transition',
                    relationship === r.value
                      ? 'border-[#0C6E6B] bg-[#E1F0EF] text-[#0C6E6B]'
                      : 'border-[#D8D0C7] bg-white text-[#19120E]',
                  )}
                >
                  {t(r.key)}
                </button>
              ))}
            </div>
          </div>
          <V2Button full size="lg" disabled={!name.trim() || create.isPending} onClick={add}>
            <Icon name="plus" className="h-5 w-5" />
            {t('famAdd')}
          </V2Button>
        </div>
      </Sheet>

      <Sheet
        open={!!removeTarget}
        onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}
        title={t('famRemove')}
        closeLabel={t('cancel')}
      >
        {removeTarget && (
          <>
            <p className="rounded-[12px] bg-[#FDEEEC] p-4 text-sm leading-relaxed text-[#C0392B]">
              {t('famRemoveAsk')}
            </p>
            <div className="mt-4 space-y-2">
              <V2Button
                full
                size="lg"
                variant="danger"
                disabled={remove.isPending}
                onClick={() => { remove.mutate(removeTarget.id, { onSuccess: () => setRemoveTarget(null) }); }}
              >
                <Icon name="trash" className="h-5 w-5" />
                {t('famRemove')}
              </V2Button>
              <V2Button full size="lg" variant="secondary" onClick={() => setRemoveTarget(null)}>
                {t('cancel')}
              </V2Button>
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}
