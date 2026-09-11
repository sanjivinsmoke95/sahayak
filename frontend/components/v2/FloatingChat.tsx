'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/common';
import { MessageBubble, PromptBox } from '@/components/assistant';
import { useAskAssistant, useTranslation } from '@/hooks';
import { useChatStore } from '@/store';

export function FloatingChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const ask = useAskAssistant();
  const { messages, pending, reset } = useChatStore();
  const endRef = useRef<HTMLDivElement>(null);

  // Don't show on the full assistant page — it's redundant there.
  const isAssistantPage = pathname === '/v2/assistant';
  if (isAssistantPage) return null;

  // Scroll to latest message.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, pending, open]);

  const unread = messages.length;

  return (
    <>
      {/* Slide-up panel */}
      {open && (
        <div
          className="floating-chat-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="floating-chat-panel">
            {/* Header */}
            <div className="floating-chat-header">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#102D63] text-white">
                  <Icon name="chat" className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#101828]">Sahayak Assistant</p>
                  <p className="text-xs text-[#667085]">{t('askGreeting').slice(0, 40)}…</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-full px-2.5 py-1 text-xs font-semibold text-[#667085] hover:bg-[#F2F4F7]"
                  >
                    {t('newChat')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-[#667085] hover:bg-[#F2F4F7]"
                  aria-label="Close"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="floating-chat-messages">
              {/* Greeting */}
              {messages.length === 0 && (
                <div className="flex gap-2.5">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#102D63] text-white">
                    <Icon name="chat" className="h-3.5 w-3.5" />
                  </span>
                  <div className="max-w-[82%] rounded-[16px] rounded-tl-[4px] border border-[#D6DDE8] bg-white p-3 shadow-[0_1px_4px_rgba(25,18,14,0.06)]">
                    <p className="text-sm leading-relaxed text-[#101828]">{t('askGreeting')}</p>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {pending && (
                <div className="flex gap-2.5">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#102D63] text-white">
                    <Icon name="chat" className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-[16px] rounded-tl-[4px] border border-[#D6DDE8] bg-white px-4 py-3 shadow-[0_1px_4px_rgba(25,18,14,0.06)]">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#102D63] [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#102D63] [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#102D63]" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="floating-chat-input">
              <PromptBox
                onSend={(q) => ask.mutate(q)}
                disabled={pending}
              />
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="floating-chat-fab"
        aria-label="Open assistant"
      >
        <Icon name={open ? 'close' : 'chat'} className="h-6 w-6 text-white" />
        {!open && unread > 0 && (
          <span className="floating-chat-badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>
    </>
  );
}
