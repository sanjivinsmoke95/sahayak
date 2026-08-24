'use client';

import { useState } from 'react';
import { Icon } from '@/components/common';
import { Button, Input, Sheet } from '@/components/ui';
import { useCreateProfile, useDeleteProfile, useProfiles, useTranslation } from '@/hooks';
import { RELATIONSHIPS, relationshipKey } from '@/lib/relationships';

export default function ProfilesPage() {
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
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('famTitle')}</h1>
          <p className="mt-2 text-lg leading-relaxed text-muted">{t('famSub')}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setAddOpen(true)}>
          <Icon name="plus" className="h-4 w-4" />
          {t('famAdd')}
        </Button>
      </header>

      <div className="space-y-2.5">
        {(profiles ?? []).map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-xl2 border border-navy-100 bg-white p-4 shadow-soft"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
              <Icon name="user" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-snug">{p.name}</p>
              <p className="text-sm text-muted">
                {p.isSelf ? t('famSelf') : t(relationshipKey(p.relationship))}
              </p>
            </div>
            {!p.isSelf && (
              <button
                type="button"
                onClick={() => setRemoveTarget({ id: p.id, name: p.name })}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-alert-600 active:bg-alert-50"
              >
                {t('famRemove')}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add member sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen} title={t('famAdd')} closeLabel={t('cancel')}>
        <div className="space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('famName')}
            aria-label={t('famName')}
          />
          <div>
            <p className="mb-2 text-sm font-semibold text-muted">{t('famRelationship')}</p>
            <div className="grid grid-cols-2 gap-2">
              {RELATIONSHIPS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  aria-pressed={relationship === r.value}
                  onClick={() => setRelationship(r.value)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    relationship === r.value
                      ? 'border-navy-600 bg-navy-50 text-navy-700'
                      : 'border-navy-200 bg-white text-ink'
                  }`}
                >
                  {t(r.key)}
                </button>
              ))}
            </div>
          </div>
          <Button full size="lg" disabled={!name.trim() || create.isPending} onClick={add}>
            <Icon name="plus" className="h-5 w-5" />
            {t('famAdd')}
          </Button>
        </div>
      </Sheet>

      {/* Remove confirmation sheet */}
      <Sheet
        open={!!removeTarget}
        onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}
        title={t('famRemove')}
        closeLabel={t('cancel')}
      >
        {removeTarget && (
          <>
            <p className="rounded-xl bg-alert-50 p-4 text-sm leading-relaxed text-alert-700">
              {t('famRemoveAsk')}
            </p>
            <div className="mt-4 space-y-2">
              <Button
                full
                size="lg"
                variant="danger"
                disabled={remove.isPending}
                onClick={() => {
                  remove.mutate(removeTarget.id, { onSuccess: () => setRemoveTarget(null) });
                }}
              >
                <Icon name="trash" className="h-5 w-5" />
                {t('famRemove')}
              </Button>
              <Button full size="lg" variant="secondary" onClick={() => setRemoveTarget(null)}>
                {t('cancel')}
              </Button>
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}
