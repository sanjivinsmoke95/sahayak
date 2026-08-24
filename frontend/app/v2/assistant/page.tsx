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
      <header className="mb-3 flex items-center justify-between gap-3">
        <h1 className="v2-heading text-2xl font-bold text-[#19120E]">{t('askTitle')}</h1>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => reset()}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#D8D0C7] bg-white px-3 py-1.5 text-sm font-semibold text-[#19120E] active:bg-[#EDE9E3]"
          >
            <Icon name="close" className="h-4 w-4" />
            {t('newChat')}
          </button>
        )}
      </header>

      {activeDoc && (
        <div className="mb-3 flex items-center gap-2 rounded-[16px] border border-[#D8D0C7] bg-white px-3.5 py-2.5 shadow-[0_1px_4px_rgba(25,18,14,0.06)]">
          <Icon name="doc" className="h-4 w-4 shrink-0 text-[#0C6E6B]" />
          <span className="shrink-0 text-sm text-[#7A6E68]">{t('chatContext')}:</span>
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#19120E]">
            {tr(activeDoc.title)}
          </span>
          <button
            type="button"
            onClick={() => setActiveDocumentId(null)}
            className="shrink-0 text-sm font-semibold text-[#0C6E6B]"
          >
            {t('chatChange')}
          </button>
        </div>
      )}

      <div className="flex-1 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-start gap-3 rounded-[16px] border border-[#D8D0C7] bg-white p-4 shadow-[0_1px_4px_rgba(25,18,14,0.06)]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0C6E6B] text-white">
              <Icon name="chat" className="h-5 w-5" />
            </span>
            <p className="text-base leading-relaxed text-[#19120E]">{t('askGreeting')}</p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {pending && (
          <div className="flex justify-start">
            <div
              className="flex items-center gap-1.5 rounded-2xl border border-[#D8D0C7] bg-white px-4 py-3.5 shadow-[0_1px_4px_rgba(25,18,14,0.06)]"
              aria-label={t('loading')}
            >
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#0C6E6B] [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#0C6E6B] [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#0C6E6B]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 mt-4 space-y-3 bg-[#F6F3EF] pb-1 pt-2">
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
