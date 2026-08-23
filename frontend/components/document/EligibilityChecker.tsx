'use client';

import { useState } from 'react';
import { Badge, Button, Card, Input, Select } from '@/components/ui';
import { Icon } from '@/components/common';
import { useCheckEligibility, useTranslation } from '@/hooks';
import { INCOMES, STATES, WORKS } from '@/lib/data/eligibility-options';
import type { EligibilityProfile, SahayakDocument } from '@/types';

/**
 * Compares what the user says with the conditions printed in the notice.
 * Deliberately hedged — it never states an official decision.
 */
export function EligibilityChecker({ document: doc }: { document: SahayakDocument }) {
  const { t, tr } = useTranslation();
  const check = useCheckEligibility();
  const [profile, setProfile] = useState<EligibilityProfile>({
    age: '', state: '', income: '', work: '',
  });

  if (!doc.elig) return null;

  const result = check.data;
  const verdictLabel =
    result?.verdict === 'likely' ? t('elLikely') : result?.verdict === 'maybe' ? t('elMaybe') : t('elNo');
  const verdictTone =
    result?.verdict === 'likely' ? 'leaf' : result?.verdict === 'maybe' ? 'amber' : 'alert';

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-3 text-xl font-bold">
        <Icon name="help" className="h-6 w-6 text-navy-600" />
        {t('applyTitle')}
      </h2>
      <p className="mt-2 text-base leading-relaxed text-muted">{t('applySub')}</p>

      {!result ? (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-base font-semibold">{t('qAge')}</span>
            <Input
              type="number"
              inputMode="numeric"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-base font-semibold">{t('qState')}</span>
            <Select value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })}>
              <option value="">{t('notSaid')}</option>
              {STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </Select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-base font-semibold">{t('qIncome')}</span>
            <Select value={profile.income} onChange={(e) => setProfile({ ...profile, income: e.target.value })}>
              <option value="">{t('notSaid')}</option>
              {INCOMES.map((band) => (
                <option key={band.id} value={band.id}>{tr(band.label)}</option>
              ))}
            </Select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-base font-semibold">{t('qWork')}</span>
            <Select value={profile.work} onChange={(e) => setProfile({ ...profile, work: e.target.value })}>
              <option value="">{t('notSaid')}</option>
              {WORKS.map((work) => (
                <option key={work.id} value={work.id}>{tr(work.label)}</option>
              ))}
            </Select>
          </label>

          <Button
            full
            size="md"
            disabled={check.isPending}
            onClick={() => check.mutate({ documentId: doc.id, profile })}
          >
            {check.isPending ? t('loading') : t('checkBtn')}
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <Badge tone={verdictTone}>{verdictLabel}</Badge>
          <p className="text-base font-semibold">{t('elBasedOn')}</p>
          <ul className="space-y-2">
            {result.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2.5 text-base leading-relaxed">
                <Icon
                  name={reason.k === 'ok' ? 'check' : reason.k === 'no' ? 'close' : 'info'}
                  className={
                    reason.k === 'ok' ? 'mt-1 h-5 w-5 shrink-0 text-leaf-600'
                    : reason.k === 'no' ? 'mt-1 h-5 w-5 shrink-0 text-alert-600'
                    : 'mt-1 h-5 w-5 shrink-0 text-muted'
                  }
                />
                <span>{reason.t}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-xl bg-navy-50 p-3.5 text-base leading-relaxed text-muted">{t('elFinal')}</p>
          <Button variant="secondary" size="md" full onClick={() => check.reset()}>
            {t('checkAgain')}
          </Button>
        </div>
      )}
    </Card>
  );
}
