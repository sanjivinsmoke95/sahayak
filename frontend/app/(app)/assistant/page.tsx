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
        <h1 className="text-2xl font-bold">{t('askTitle')}</h1>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => reset()}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-navy-200 bg-white px-3 py-1.5 text-sm font-semibold text-navy-700 active:bg-navy-50"
          >
            <Icon name="plus" className="h-4 w-4" />
            {t('newChat')}
          </button>
        )}
      </header>

      {/* Context banner — which document the assistant is answering about. */}
      <div className="mb-3 flex items-center gap-2 rounded-xl2 border border-navy-100 bg-white px-3.5 py-2.5 shadow-soft">
        <Icon name="doc" className="h-4 w-4 shrink-0 text-navy-600" />
        <span className="shrink-0 text-sm text-muted">{t('chatContext')}:</span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-navy-700">
          {activeDoc ? tr(activeDoc.title) : t('askAllDocs')}
        </span>
        {activeDoc && (
          <button
            type="button"
            onClick={() => setActiveDocumentId(null)}
            className="shrink-0 text-sm font-semibold text-navy-600"
          >
            {t('chatChange')}
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-start gap-3 rounded-xl2 border border-navy-100 bg-white p-4 shadow-soft">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-600 text-white">
              <Icon name="chat" className="h-5 w-5" />
            </span>
            <p className="text-base leading-relaxed">{t('askGreeting')}</p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {pending && (
          <div className="flex justify-start">
            <div
              className="flex items-center gap-1.5 rounded-2xl border border-navy-100 bg-white px-4 py-3.5 shadow-soft"
              aria-label={t('loading')}
            >
              <span className="h-2 w-2 animate-bounce rounded-full bg-navy-300 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-navy-300 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-navy-300" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 mt-4 space-y-3 bg-paper pb-1 pt-2">
        {messages.length === 0 && <SuggestedQuestions onPick={(q) => ask.mutate(q)} />}
        <div className="flex items-center justify-start">
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

export default function AssistantPage() {
  return (
    <Suspense fallback={null}>
      <AssistantScreen />
    </Suspense>
  );
}
