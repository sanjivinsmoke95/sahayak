'use client';

import { Button } from '@/components/ui';
import { Icon } from '@/components/common';
import { useSpeech, useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * The Listen control for a document summary. It reads the simplified summary —
 * never the raw notice — in the reader's chosen language, and offers pause,
 * resume and stop. Where the device has no speech engine it shows a quiet
 * note instead of a dead button.
 */
export function ListenButton({ text, className }: { text: string; className?: string }) {
  const { t } = useTranslation();
  const { supported, speak, pause, resume, stop, state } = useSpeech();

  if (!supported) {
    return <p className={cn('text-sm text-muted', className)}>{t('audioOff')}</p>;
  }

  const idle = state === 'idle';

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {idle ? (
        <Button variant="secondary" size="md" onClick={() => speak(text)} aria-label={t('listen')}>
          <Icon name="speaker" className="h-5 w-5" />
          {t('listen')}
        </Button>
      ) : (
        <>
          {state === 'speaking' ? (
            <Button
              variant="secondary"
              size="md"
              onClick={pause}
              className="animate-pulsering"
              aria-label={t('pauseAudio')}
            >
              <Icon name="clock" className="h-5 w-5" />
              {t('pauseAudio')}
            </Button>
          ) : (
            <Button variant="secondary" size="md" onClick={resume} aria-label={t('resumeAudio')}>
              <Icon name="play" className="h-5 w-5" />
              {t('resumeAudio')}
            </Button>
          )}
          <Button variant="ghost" size="md" onClick={stop} aria-label={t('replayAudio')}>
            <Icon name="close" className="h-5 w-5" />
          </Button>
        </>
      )}
    </div>
  );
}
