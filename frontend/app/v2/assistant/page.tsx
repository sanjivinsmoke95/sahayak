'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatUpload, MessageBubble, PromptBox, SuggestedQuestions } from '@/components/assistant';
import { Icon } from '@/components/common';
import { useAskAssistant, useDocuments, useTranslation } from '@/hooks';
import { useChatStore, useWorkspaceStore } from '@/store';

function AssistantScreen() {
  const params = useSearchParams();
  const { t, tr } = useTranslation();
  const ask = useAskAssistant();
  const { messages, pending, reset } = useChatStore();
  const { data: documents } = useDocuments();
  const activeDocumentId = useWorkspaceStore((s) => s.activeDocumentId);
  const setActiveDocumentId = useWorkspaceStore((s) => s.setActiveDocumentId);
  const activeDoc = documents?.find((d) => d.id === activeDocumentId);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, pending]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="v2-heading text-2xl font-bold text-[#101828]">{t('navAsk')}</h1>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => reset()}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#D6DDE8] bg-white px-3 py-1.5 text-xs font-semibold text-[#101828] active:bg-[#E8EDF5]"
            >
              <Icon name="close" className="h-3.5 w-3.5" />
              {t('newChat')}
            </button>
          )}
          <button
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#667085] active:bg-[#EAF1FF]"
          >
            <Icon name="clock" className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Context banner */}
      {activeDoc && (
        <div className="mb-3 flex items-center gap-2 rounded-[14px] border border-[#D6DDE8] bg-white px-3.5 py-2.5 shadow-[0_1px_4px_rgba(25,18,14,0.06)]">
          <Icon name="doc" className="h-4 w-4 shrink-0 text-[#102D63]" />
          <span className="shrink-0 text-xs text-[#667085]">{t('chatContext')}:</span>
          <span className="min-w-0 flex-1 truncate text-xs font-bold text-[#101828]">
            {tr(activeDoc.title)}
          </span>
          <button
            type="button"
            onClick={() => setActiveDocumentId(null)}
            className="shrink-0 text-xs font-semibold text-[#102D63]"
          >
            {t('chatChange')}
          </button>
        </div>
      )}

      <div className="flex-1 space-y-3">
        {/* Bot greeting */}
        {messages.length === 0 && (
          <div className="flex gap-2.5">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#102D63] text-white">
              <Icon name="chat" className="h-4 w-4" />
            </span>
            <div className="max-w-[80%] rounded-[16px] rounded-tl-[4px] border border-[#D6DDE8] bg-white p-3.5 shadow-[0_1px_4px_rgba(25,18,14,0.06)]">
              <p className="text-sm leading-relaxed text-[#101828]">{t('askGreeting')}</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {pending && (
          <div className="flex gap-2.5">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#102D63] text-white">
              <Icon name="chat" className="h-4 w-4" />
            </span>
            <div
              className="flex items-center gap-1.5 rounded-[16px] rounded-tl-[4px] border border-[#D6DDE8] bg-white px-4 py-3.5 shadow-[0_1px_4px_rgba(25,18,14,0.06)]"
              aria-label={t('loading')}
            >
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#102D63] [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#102D63] [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#102D63]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Bottom section */}
      <div className="sticky bottom-0 mt-4 space-y-3 bg-[#F8FAFC] pb-1 pt-2">
        {messages.length === 0 && <SuggestedQuestions onPick={(q) => ask.mutate(q)} />}
        <div className="flex items-center gap-2">
          <ChatUpload />
        </div>
        <PromptBox
          onSend={(question) => ask.mutate(question)}
          disabled={pending}
          autoListen={params.get('listen') === '1'}
        />
      </div>
    </div>
  );
}

export default function V2AssistantPage() {
  return (
    <Suspense fallback={null}>
      <AssistantScreen />
    </Suspense>
  );
}
