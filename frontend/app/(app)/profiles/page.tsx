'use client';

import { useState } from 'react';
import { Icon } from '@/components/common';
import { Button, Input } from '@/components/ui';
import { useCreateProfile, useDeleteProfile, useProfiles, useTranslation } from '@/hooks';
import { RELATIONSHIPS, relationshipKey } from '@/lib/relationships';

export default function ProfilesPage() {
  const { t } = useTranslation();
  const { data: profiles } = useProfiles();
  const create = useCreateProfile();
  const remove = useDeleteProfile();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('mother');

  const add = () => {
    if (!name.trim()) return;
    create.mutate({ name: name.trim(), relationship }, { onSuccess: () => setName('') });
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">{t('famTitle')}</h1>
        <p className="mt-2 text-lg leading-relaxed text-muted">{t('famSub')}</p>
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
                onClick={() => {
                  if (window.confirm(t('famRemoveAsk'))) remove.mutate(p.id);
                }}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-alert-600 active:bg-alert-50"
              >
                {t('famRemove')}
              </button>
            )}
          </div>
        ))}
      </div>

      <section className="space-y-3 rounded-xl2 border border-navy-100 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold">{t('famAdd')}</h2>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('famName')}
          aria-label={t('famName')}
        />
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-muted">{t('famRelationship')}</span>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="min-h-[52px] w-full rounded-2xl border border-navy-200 bg-white px-4 text-base"
          >
            {RELATIONSHIPS.map((r) => (
              <option key={r.value} value={r.value}>
                {t(r.key)}
              </option>
            ))}
          </select>
        </label>
        <Button full size="md" disabled={!name.trim() || create.isPending} onClick={add}>
          <Icon name="plus" className="h-5 w-5" />
          {t('famAdd')}
        </Button>
      </section>
    </div>
  );
}
