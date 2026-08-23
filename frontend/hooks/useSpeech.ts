'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LANGS } from '@/lib/i18n';
import { useSettingsStore } from '@/store';

/** Playback state for the Listen control. */
export type SpeechState = 'idle' | 'speaking' | 'paused';

/**
 * Text to speech, in the reader's chosen language.
 *
 * This is the single TTS source for the whole app — the read-aloud button on
 * an assistant answer and the Listen control on a document summary both come
 * through here, so there is one voice-selection and one lifecycle to reason
 * about. The browser's Web Speech synthesis is used where present; where it is
 * not, `supported` is false and callers fall back to showing text only.
 */
export function useSpeech() {
  const language = useSettingsStore((s) => s.language);
  const readAloud = useSettingsStore((s) => s.readAloud);

  const supported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance !== 'undefined';

  const [state, setState] = useState<SpeechState>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speechLang = LANGS.find((l) => l.code === language)?.speech ?? 'en-IN';

  /**
   * Pick the best installed voice for the language. Voices are scored so a
   * natural/neural voice in the exact locale wins over a robotic fallback —
   * the biggest quality lever available with the browser engine. getVoices()
   * can be empty until the async "voiceschanged" event, so callers must be
   * resilient to a null result.
   */
  const pickVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!supported) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const target = speechLang.toLowerCase();
    const base = target.split('-')[0];
    // Names that signal a higher-quality voice across platforms.
    const premium = /(natural|neural|google|enhanced|premium|siri|wavenet)/i;

    const score = (v: SpeechSynthesisVoice): number => {
      const lang = (v.lang || '').toLowerCase();
      if (!lang.startsWith(base)) return -1;
      let s = lang === target ? 4 : 2; // exact locale beats same-language
      if (premium.test(v.name)) s += 3;
      if (v.localService) s += 1; // installed locally = lower latency, usually clearer
      return s;
    };

    let best: SpeechSynthesisVoice | null = null;
    let bestScore = -1;
    for (const v of voices) {
      const s = score(v);
      if (s > bestScore) {
        best = v;
        bestScore = s;
      }
    }
    return bestScore >= 0 ? best : null;
  }, [supported, speechLang]);

  const stop = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignored */
    }
    utteranceRef.current = null;
    setState('idle');
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text.trim()) return false;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speechLang;
        const voice = pickVoice();
        if (voice) utterance.voice = voice;
        utterance.rate = 0.92;
        utterance.onend = () => {
          utteranceRef.current = null;
          setState('idle');
        };
        utterance.onerror = () => {
          utteranceRef.current = null;
          setState('idle');
        };
        utteranceRef.current = utterance;
        setState('speaking');
        window.speechSynthesis.speak(utterance);
        return true;
      } catch {
        setState('idle');
        return false;
      }
    },
    [supported, speechLang, pickVoice],
  );

  const pause = useCallback(() => {
    if (!supported || state !== 'speaking') return;
    try {
      window.speechSynthesis.pause();
      setState('paused');
    } catch {
      /* ignored */
    }
  }, [supported, state]);

  const resume = useCallback(() => {
    if (!supported || state !== 'paused') return;
    try {
      window.speechSynthesis.resume();
      setState('speaking');
    } catch {
      /* ignored */
    }
  }, [supported, state]);

  // Chrome loads voices asynchronously; touch getVoices() and listen for the
  // event so a good voice is ready by the time the reader taps Listen.
  useEffect(() => {
    if (!supported) return;
    const warm = () => window.speechSynthesis.getVoices();
    warm();
    window.speechSynthesis.addEventListener?.('voiceschanged', warm);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', warm);
  }, [supported]);

  // Stop any in-flight speech when the language changes or the hook unmounts,
  // so a Hindi utterance never continues under an English screen.
  useEffect(() => {
    return () => {
      if (supported) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* ignored */
        }
      }
    };
  }, [supported, speechLang]);

  return { supported, speak, pause, resume, stop, state, readAloud };
}
