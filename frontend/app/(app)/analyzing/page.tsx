'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Progress } from '@/components/ui';
import { Icon } from '@/components/common';
import { useAnalyzeDocument, useTranslation } from '@/hooks';
import { ApiRequestError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import type { StringKey } from '@/lib/i18n';

const STAGE_KEYS: StringKey[] = ['an1', 'an2', 'an3', 'an4', 'an5'];

/**
 * The waiting screen. The stages are paced deliberately: watching named
 * steps complete is far less frightening than a blank spinner when the
 * document in question decides whether your pension arrives.
 */
function AnalyzingScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useTranslation();
  const analyze = useAnalyzeDocument();
  const setDirection = useUiStore((s) => s.setDirection);

  const sampleId = params.get('sampleId') ?? undefined;
  const fileId = params.get('fileId') ?? undefined;
  const fileName = params.get('name') ?? undefined;

  const [stage, setStage] = useState(0);
  const finished = stage >= STAGE_KEYS.length;

  useEffect(() => {
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setStage(current);
      if (current >= STAGE_KEYS.length) clearInterval(id);
    }, 780);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    analyze.mutate({ sampleId, fileId, fileName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = () => {
    const id = analyze.data?.id ?? sampleId;
    if (!id) return;
    setDirection('push');
    router.replace(`/documents/${id}`);
  };

  useEffect(() => {
    if (finished && analyze.isSuccess) {
      const id = setTimeout(open, 900);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, analyze.isSuccess]);

  return (
    <div className="pt-2">
      <Card className="p-5">
        <div className="flex items-center gap-3.5">
          <span
            className={cn(
              'grid h-14 w-14 shrink-0 place-items-center rounded-2xl',
              finished ? 'bg-leaf-50 text-leaf-600' : 'animate-pulsering bg-navy-50 text-navy-600',
            )}
          >
            <Icon name={finished ? 'check' : 'spark'} className="h-8 w-8" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight" role="status" aria-live="polite">
              {finished ? t('anDone') : t('anTitle')}
            </h1>
            {fileName && <p className="mt-1 line-clamp-2 break-all text-base text-muted">{fileName}</p>}
          </div>
        </div>

        <p className="mt-4 text-lg leading-relaxed text-muted">{t('anCalm')}</p>

        <ul className="mt-6 space-y-3.5">
          {STAGE_KEYS.map((key, index) => {
            const state = index < stage ? 'done' : index === stage ? 'now' : 'wait';
            return (
              <li
                key={key}
                className={cn('flex items-center gap-3.5 text-lg transition', state === 'wait' && 'opacity-40')}
              >
                <span
                  className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-full',
                    state === 'done' ? 'bg-leaf-600 text-white'
                    : state === 'now' ? 'bg-navy-100 text-navy-600'
                    : 'bg-slate-100 text-slate-400',
                  )}
                >
                  {state === 'done' ? (
                    <Icon name="check" className="h-5 w-5" strokeWidth={3} />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-current" />
                  )}
                </span>
                <span className={cn(state === 'done' && 'font-semibold')}>{t(key)}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-6">
          <Progress value={stage} total={STAGE_KEYS.length} />
        </div>

        {finished && analyze.isSuccess && (
          <div className="mt-6 animate-rise">
            <Button full size="md" onClick={open}>
              <Icon name="right" className="h-5 w-5" />
              {t('anOpen')}
            </Button>
          </div>
        )}

        {analyze.isError && (
          <p className="mt-5 rounded-xl bg-alert-50 p-3.5 text-base text-alert-600">
            {analyze.error instanceof ApiRequestError ? analyze.error.message : t('errorTitle')}
          </p>
        )}
      </Card>
    </div>
  );
}

export default function AnalyzingPage() {
  return (
    <Suspense fallback={null}>
      <AnalyzingScreen />
    </Suspense>
  );
}
