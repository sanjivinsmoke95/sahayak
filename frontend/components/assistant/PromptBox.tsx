'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/common';
import { Button, Textarea } from '@/components/ui';
import { useSpeechRecognition, useTranslation } from '@/hooks';
import type { RecognitionError } from '@/hooks';
import type { StringKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface PromptBoxProps {
  onSend: (question: string) => void;
  disabled?: boolean;
  autoListen?: boolean;
}

const ERROR_STRING: Record<RecognitionError, StringKey> = {
  denied: 'micDenied',
  'no-mic': 'micNoMic',
  'no-speech': 'micNoSpeech',
  network: 'micNetwork',
  unsupported: 'micUnsupported',
  unknown: 'micError',
};

/**
 * Type a question, or hold the microphone and speak it. Speech follows the
 * chosen language, streams words as they are heard, and sends automatically
 * when the reader stops talking. Every failure falls back to plain typing.
 */
export function PromptBox({ onSend, disabled, autoListen }: PromptBoxProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  // Speech support is a browser-only capability, so it is unknown during SSR.
  // Gate the mic control on a post-mount flag so the server and first client
  // render agree (otherwise React throws a hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  // Guard so a single spoken phrase is only ever sent once.
  const sentRef = useRef(false);

  const submit = (raw?: string) => {
    const question = (raw ?? value).trim();
    if (!question || disabled) return;
    onSend(question);
    setValue('');
  };

  const speech = useSpeechRecognition({
    onFinal: (text) => {
      if (sentRef.current) return;
      sentRef.current = true;
      setValue(text);
      submit(text);
    },
  });

  // Surface recognition failures as a friendly toast, once each.
  useEffect(() => {
    if (speech.status === 'error' && speech.error) {
      toast.error(t(ERROR_STRING[speech.error]));
    }
  }, [speech.status, speech.error, t]);

  // While listening, mirror the live transcript into the box so the reader
  // sees their words appear.
  useEffect(() => {
    if (speech.listening && speech.transcript) setValue(speech.transcript);
  }, [speech.listening, speech.transcript]);

  const startListening = () => {
    sentRef.current = false;
    setValue('');
    speech.start();
  };

  useEffect(() => {
    if (autoListen && speech.supported) startListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoListen]);

  const listening = speech.status === 'listening';
  const processing = speech.status === 'processing';
  const active = listening || processing;

  const placeholder = listening
    ? t('listening')
    : processing
      ? t('micUnderstand')
      : t('askPlaceholder');

  return (
    <div className="space-y-2">
      {active && (
        <div
          className="flex items-center gap-2 rounded-xl bg-alert-50 px-3 py-2 text-sm font-medium text-alert-600"
          role="status"
          aria-live="polite"
        >
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full',
              listening ? 'animate-pulse bg-alert-600' : 'bg-amberx-500',
            )}
          />
          {listening ? t('listening') : t('micUnderstand')}
          <button
            type="button"
            onClick={speech.cancel}
            className="ml-auto rounded-lg px-2 py-0.5 font-semibold text-navy-600 hover:bg-white"
          >
            {t('cancel')}
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <Textarea
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          className="min-h-[52px] flex-1"
        />

        {mounted && speech.supported && (
          <Button
            variant={active ? 'danger' : 'secondary'}
            size="icon"
            aria-label={active ? t('micStop') : t('micStart')}
            className={cn('shrink-0', listening && 'animate-pulsering')}
            onClick={active ? speech.stop : startListening}
          >
            <Icon name={active ? 'close' : 'mic'} className="h-5 w-5" />
          </Button>
        )}

        <Button
          size="icon"
          aria-label={t('send')}
          disabled={disabled || !value.trim()}
          onClick={() => submit()}
        >
          <Icon name="right" className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
