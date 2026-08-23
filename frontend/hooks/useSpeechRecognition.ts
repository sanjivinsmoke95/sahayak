'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LANGS } from '@/lib/i18n';
import { useSettingsStore } from '@/store';
import { buzz } from '@/utils/format';

/**
 * Speech-to-text for the assistant.
 *
 * This wraps the browser's Web Speech API behind a small, stable interface —
 * `start`, `stop`, `cancel`, plus `status`, `transcript` and a typed `error`.
 * Everything the UI needs is expressed in those terms and nothing leaks the
 * underlying engine, so the recognition layer can later be swapped for a
 * server-side speech-to-text call without touching the components.
 *
 * The recogniser follows the reader's chosen website language, streams interim
 * words as they are heard, and reports every failure mode (permission blocked,
 * no microphone, no speech, network, unsupported) as a friendly typed reason
 * rather than leaving the button stuck in a listening state.
 */

export type RecognitionStatus = 'idle' | 'listening' | 'processing' | 'error';

export type RecognitionError =
  | 'denied'
  | 'no-mic'
  | 'no-speech'
  | 'network'
  | 'unsupported'
  | 'unknown';

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
  resultIndex: number;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onspeechend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as RecognitionCtor | null;
}

interface Options {
  /** Called once with the final transcript when the user finishes speaking. */
  onFinal?: (text: string) => void;
}

export function useSpeechRecognition({ onFinal }: Options = {}) {
  const language = useSettingsStore((s) => s.language);
  const supported = typeof window !== 'undefined' && getCtor() !== null;

  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<RecognitionError | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef('');
  // True while a user-initiated cancel is in flight, so `onend` stays silent.
  const cancelledRef = useRef(false);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const cleanup = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      rec.onstart = rec.onaudiostart = rec.onspeechend = null;
      rec.onresult = rec.onerror = rec.onend = null;
    }
    recognitionRef.current = null;
  }, []);

  const stop = useCallback(() => {
    // Ask the engine to finalise; the final transcript arrives via onend.
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignored */
    }
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignored */
    }
    cleanup();
    setStatus('idle');
    setTranscript('');
    setError(null);
  }, [cleanup]);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setError('unsupported');
      setStatus('error');
      return;
    }
    // Restarting: drop any previous instance first.
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignored */
    }
    cleanup();

    cancelledRef.current = false;
    finalRef.current = '';
    setTranscript('');
    setError(null);

    const rec = new Ctor();
    rec.lang = LANGS.find((l) => l.code === language)?.speech ?? 'en-IN';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setStatus('listening');
      buzz(12);
    };

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) finalRef.current += text;
        else interim += text;
      }
      setTranscript((finalRef.current + interim).trim());
    };

    // The user stopped speaking; the engine is now finalising.
    rec.onspeechend = () => setStatus('processing');

    rec.onerror = (event) => {
      if (cancelledRef.current || event.error === 'aborted') return;
      const map: Record<string, RecognitionError> = {
        'not-allowed': 'denied',
        'service-not-allowed': 'denied',
        'audio-capture': 'no-mic',
        'no-speech': 'no-speech',
        network: 'network',
      };
      setError(map[event.error] ?? 'unknown');
      setStatus('error');
    };

    rec.onend = () => {
      const finalText = finalRef.current.trim();
      cleanup();
      if (cancelledRef.current) return;
      setStatus((prev) => (prev === 'error' ? 'error' : 'idle'));
      if (finalText) {
        setTranscript(finalText);
        onFinalRef.current?.(finalText);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      // start() throws if called while already running; treat as unknown.
      setError('unknown');
      setStatus('error');
    }
  }, [language, cleanup]);

  // Never leave the microphone open across an unmount.
  useEffect(() => () => {
    cancelledRef.current = true;
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignored */
    }
    cleanup();
  }, [cleanup]);

  return {
    supported,
    status,
    transcript,
    error,
    listening: status === 'listening' || status === 'processing',
    start,
    stop,
    cancel,
  };
}
