'use client';

/* eslint-disable @next/next/no-img-element */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/common';
import { useAnalyzeDocument } from '@/hooks';
import { useUiStore } from '@/store';
import { humanBytes } from '@/utils/format';

const STEPS = [
  'Reading document',
  'Extracting important info',
  'Understanding content',
  'Preparing your answer',
];

function AnalyzingScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const analyze = useAnalyzeDocument();
  const setDirection = useUiStore((s) => s.setDirection);

  const sampleId = params.get('sampleId') ?? undefined;
  const fileId = params.get('fileId') ?? undefined;
  const fileName = params.get('name') ?? undefined;
  const docParam = params.get('doc') ?? undefined;
  const fromBytes = Number(params.get('from')) || 0;
  const toBytes = Number(params.get('to')) || 0;

  const [stage, setStage] = useState(0);
  const finished = stage >= STEPS.length;

  useEffect(() => {
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setStage(current);
      if (current >= STEPS.length) clearInterval(id);
    }, 850);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // When arriving with an already-analysed document id, just wait and open it.
    if (!docParam) analyze.mutate({ sampleId, fileId, fileName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = docParam ?? analyze.data?.id ?? sampleId;
    if (finished && id && (docParam || analyze.isSuccess)) {
      const timer = setTimeout(() => {
        setDirection('push');
        router.replace(`/v2/documents/${id}`);
      }, 700);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, analyze.isSuccess, docParam]);

  return (
    <div className="flex min-h-full flex-col items-center pt-6 text-center">
      <h1 className="v2-heading text-2xl font-extrabold text-[#101828]">Processing...</h1>

      <img
        src="/v2-assets/illustration-processing.svg"
        alt=""
        className="mt-6 h-44 w-44"
        draggable={false}
      />

      <h2 className="v2-heading mt-6 max-w-[18rem] text-xl font-bold leading-snug text-[#101828]">
        Extracting and understanding your document
      </h2>
      <p className="mt-2 text-base text-[#667085]">This may take a few seconds...</p>

      {fromBytes > 0 && toBytes > 0 && toBytes < fromBytes && (
        <div className="mt-4 flex items-center gap-2 rounded-full bg-[#EAF7F0] px-4 py-2 text-sm font-semibold text-[#2FA66A]">
          <Icon name="check" className="h-4 w-4" strokeWidth={3} />
          Compressed {humanBytes(fromBytes)} → {humanBytes(toBytes)} for government upload
        </div>
      )}

      {/* Steps */}
      <ul className="mt-6 w-full space-y-3 rounded-[20px] bg-[#FFF9F0] p-5 text-left">
        {STEPS.map((label, i) => {
          const state = i < stage ? 'done' : i === stage ? 'now' : 'wait';
          return (
            <li key={label} className={`flex items-center gap-3 ${state === 'wait' ? 'opacity-45' : ''}`}>
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                  state === 'done'
                    ? 'bg-[#2E9B67] text-white'
                    : state === 'now'
                      ? 'animate-spin border-2 border-[#F4A340] border-t-transparent'
                      : 'border-2 border-[#D9E2F0]'
                }`}
              >
                {state === 'done' && <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              <span className="text-[15px] text-[#101828]">{label}</span>
            </li>
          );
        })}
      </ul>

      {/* Safety */}
      <div className="mt-4 flex w-full items-center gap-3 rounded-[18px] bg-[#EAF7EF] p-4 text-left">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#2E9B67]">
          <Icon name="lock" className="h-5 w-5" />
        </span>
        <p className="text-sm font-bold text-[#2E9B67]">Your data is safe and secure.</p>
      </div>

      {analyze.isError && (
        <p className="mt-5 w-full rounded-[14px] bg-[#FDE8EA] p-4 text-sm text-[#DC3545]">
          Something went wrong while reading this document. Please try again.
        </p>
      )}
    </div>
  );
}

export default function V2AnalyzingPage() {
  return (
    <Suspense fallback={null}>
      <AnalyzingScreen />
    </Suspense>
  );
}
