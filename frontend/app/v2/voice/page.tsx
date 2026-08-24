'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useAskAssistant, useSpeech, useSpeechRecognition, useTranslation } from '@/hooks';
import { useChatStore, useUiStore } from '@/store';

export default function V2VoicePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const ask = useAskAssistant();
  const speech = useSpeech();
  const { messages, pending } = useChatStore();
  const setDirection = useUiStore((s) => s.setDirection);

  const rec = useSpeechRecognition({
    onFinal: (text) => { if (text.trim()) ask.mutate(text.trim()); },
  });

  // Browser-capability checks only resolve on the client; gate their UI to
  // avoid a server/client hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const thinking = pending || ask.isPending;
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const lastBot = [...messages].reverse().find((m) => m.role === 'assistant');

  const statusTitle = rec.listening ? 'Listening...' : thinking ? 'Thinking...' : 'Tap to speak';
  const statusSub = rec.listening ? 'Speak now' : thinking ? 'Sahayak is preparing your answer' : 'Ask Sahayak about any document';

  const toggleMic = () => {
    if (!rec.supported) { setDirection('push'); router.push('/v2/assistant'); return; }
    if (rec.listening) rec.stop();
    else rec.start();
  };

  return (
    <div className="flex min-h-full flex-col items-center">
      {/* Mic button */}
      <button
        type="button"
        onClick={toggleMic}
        aria-label={rec.listening ? 'Stop listening' : 'Start listening'}
        className="relative mt-6 grid h-40 w-40 place-items-center"
      >
        <span className={`absolute inset-0 rounded-full bg-[#EAF1FF] ${rec.listening ? 'animate-ping' : ''}`} />
        <span className="absolute inset-3 rounded-full bg-[#DCE7FB]" />
        <span className="relative grid h-24 w-24 place-items-center rounded-full bg-[#102D63] text-white shadow-[0_10px_30px_rgba(16,40,99,0.35)]">
          <Icon name="mic" className="h-10 w-10" />
        </span>
      </button>

      <h1 className="v2-heading mt-7 text-2xl font-extrabold text-[#101828]">{statusTitle}</h1>
      <p className="mt-1 text-base text-[#667085]">{statusSub}</p>

      {mounted && !rec.supported && (
        <p className="mt-3 max-w-[18rem] text-center text-sm text-[#667085]">
          Voice input isn&apos;t available in this browser — tap the mic to type your question instead.
        </p>
      )}

      {/* Conversation */}
      <div className="mt-8 w-full space-y-4">
        {lastUser && (
          <div className="flex justify-end">
            <p className="max-w-[80%] rounded-[18px] rounded-tr-[6px] bg-[#EAF1FF] px-4 py-3 text-sm font-medium text-[#101828]">
              {lastUser.text}
            </p>
          </div>
        )}

        {thinking && (
          <div className="flex items-start gap-2.5">
            <img src="/v2-assets/logo-mark.svg" alt="" className="h-9 w-9 rounded-full bg-[#EAF1FF] p-1" />
            <div className="flex items-center gap-1.5 rounded-[18px] rounded-tl-[6px] bg-white px-4 py-3.5 shadow-[0_1px_4px_rgba(16,40,99,0.06)]">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#102D63] [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#102D63] [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#102D63]" />
            </div>
          </div>
        )}

        {!thinking && lastBot && (
          <div className="flex items-start gap-2.5">
            <img src="/v2-assets/logo-mark.svg" alt="" className="h-9 w-9 shrink-0 rounded-full bg-[#EAF1FF] p-1" />
            <div className="min-w-0 flex-1 rounded-[18px] rounded-tl-[6px] bg-[#EAF1FF] p-4 shadow-[0_1px_4px_rgba(16,40,99,0.06)]">
              <p className="text-sm leading-relaxed text-[#101828]">{lastBot.text}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => (speech.state === 'speaking' ? speech.stop() : speech.speak(lastBot.text))}
                  disabled={!speech.supported}
                  className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#102D63] shadow-sm disabled:opacity-50"
                >
                  <Icon name={speech.state === 'speaking' ? 'close' : 'speaker'} className="h-4 w-4" />
                  {speech.state === 'speaking' ? 'Stop' : 'Replay'}
                </button>
                <button
                  type="button"
                  onClick={toggleMic}
                  className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#102D63] shadow-sm"
                >
                  <Icon name="mic" className="h-4 w-4" />
                  Ask another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {messages.length === 0 && !thinking && (
        <button
          type="button"
          onClick={() => { setDirection('push'); router.push('/v2/assistant'); }}
          className="mt-8 flex items-center gap-2 rounded-full border border-[#D9E2F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#102D63] active:bg-[#F8FAFC]"
        >
          <Icon name="chat" className="h-4 w-4" />
          {t('navAsk')}
        </button>
      )}
    </div>
  );
}
