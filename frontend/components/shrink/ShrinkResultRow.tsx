'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge, Button, Card } from '@/components/ui';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import type { ShrinkEntry, ShrinkResult } from '@/types';
import { saveBlob, shareBlob } from '@/utils/compression';
import { buzz, humanBytes } from '@/utils/format';

interface ShrinkResultRowProps {
  entry: ShrinkEntry;
  result: 'working' | ShrinkResult | undefined;
  outUrl: string | null;
}

export function ShrinkResultRow({ entry, result, outUrl }: ShrinkResultRowProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [comparing, setComparing] = useState(false);

  const working = !result || result === 'working';
  const done = working ? null : result;

  const pct =
    done && done.originalSize
      ? Math.max(0, Math.round((1 - (done.size ?? 0) / done.originalSize) * 100))
      : 0;
  const barWidth =
    done && done.originalSize
      ? Math.max(4, Math.round(((done.size ?? 0) / done.originalSize) * 100))
      : 100;

  const note = !done
    ? null
    : done.status === 'untouched'
      ? t('shrinkAlready')
      : done.status === 'zipped'
        ? t('shrinkZip')
        : done.status === 'failed'
          ? t('shrinkFail')
          : done.status === 'partial'
            ? t('shrinkPartial')
            : null;

  const preview = comparing ? entry.url : (outUrl ?? entry.url);

  return (
    <Card className="animate-rise p-3.5">
      <div className="flex gap-3.5">
        <div
          onPointerDown={() => entry.url && outUrl && setComparing(true)}
          onPointerUp={() => setComparing(false)}
          onPointerLeave={() => setComparing(false)}
          className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-navy-50"
        >
          {preview ? (
            // Object URLs cannot go through next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon name="doc" className="h-8 w-8 text-navy-400" />
          )}
          {working && <span className="absolute inset-0 animate-pulse bg-white/60" />}
          {comparing && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-0.5 text-center text-[10px] text-white">
              {t('shrinkBefore')}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 break-all font-semibold leading-snug">{entry.file.name}</p>

          {working ? (
            <p className="mt-1.5 text-base text-muted">{t('shrinkWorking')}</p>
          ) : done && done.status === 'failed' ? (
            <p className="mt-1.5 text-base text-alert-600">{t('shrinkFail')}</p>
          ) : (
            done && (
              <>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-base text-muted line-through">{humanBytes(done.originalSize)}</span>
                  <Icon name="right" className="h-4 w-4 shrink-0 text-muted" />
                  <span className="text-xl font-bold text-leaf-700">{humanBytes(done.size ?? 0)}</span>
                  {pct > 0 && <Badge tone="leaf">−{pct}%</Badge>}
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-navy-100">
                  <div
                    className="h-full rounded-full bg-leaf-600 transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                {done.width && (
                  <p className="mt-1.5 text-sm text-muted">
                    {done.sourceWidth ? `${done.sourceWidth}×${done.sourceHeight} → ` : ''}
                    {done.width}×{done.height}
                  </p>
                )}
              </>
            )
          )}
        </div>
      </div>

      {note && (
        <p className="mt-3 rounded-xl bg-navy-50 px-3.5 py-2.5 text-base leading-relaxed text-muted">{note}</p>
      )}

      {done?.blob && done.status !== 'failed' && (
        <>
          {entry.url && outUrl && <p className="mt-2.5 text-sm text-muted">{t('shrinkTap')}</p>}
          <div className="mt-3 flex gap-2">
            <Button
              size="md"
              className="flex-1 px-3 text-base"
              onClick={() => {
                buzz(12);
                saveBlob(done.blob!, done.outName ?? done.name);
              }}
            >
              <Icon name="save" className="h-5 w-5" />
              {t('shrinkSave')}
            </Button>
            <Button
              size="md"
              variant="secondary"
              className="px-3 text-base"
              onClick={async () => {
                buzz(12);
                const shared = await shareBlob(done.blob!, done.outName ?? done.name, done.outType);
                if (!shared) {
                  saveBlob(done.blob!, done.outName ?? done.name);
                  toast.success(t('shrinkSave'));
                }
              }}
            >
              <Icon name="share" className="h-5 w-5" />
              {t('shrinkShare')}
            </Button>
          </div>
          {done.kind === 'image' && (
            <button
              type="button"
              onClick={() => router.push(`/analyzing?sampleId=pension&simulated=1&name=${encodeURIComponent(done.outName ?? done.name)}`)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-base font-semibold text-navy-600 active:bg-navy-50"
            >
              <Icon name="spark" className="h-5 w-5" />
              {t('shrinkUse')}
            </button>
          )}
        </>
      )}
    </Card>
  );
}
