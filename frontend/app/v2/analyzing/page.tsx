'use client';

/* eslint-disable @next/next/no-img-element */

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/common';
import { useAnalyzeDocument } from '@/hooks';
import { GOV_SERVICES } from '@/lib/data/gov-services';
import { documentSatisfies } from '@/lib/requirement-match';
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
  const hasCalledRef = useRef(false);

  const sampleId = params.get('sampleId') ?? undefined;
  const fileId = params.get('fileId') ?? undefined;
  const fileName = params.get('name') ?? undefined;
  const docParam = params.get('doc') ?? undefined;
  const fromBytes = Number(params.get('from')) || 0;
  const toBytes = Number(params.get('to')) || 0;

  const [stage, setStage] = useState(0);
  const [showSlow, setShowSlow] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const ready = docParam ? true : analyze.isSuccess;

  // Walk the steps animation while analysis is in progress
  useEffect(() => {
    if (ready) return;
    const id = setInterval(() => {
      setStage((s) => Math.min(s + 1, STEPS.length - 1));
    }, 450);
    return () => clearInterval(id);
  }, [ready]);

  // Show "taking longer" message after 30s
  useEffect(() => {
    if (ready) return;
    const id = setTimeout(() => setShowSlow(true), 30_000);
    return () => clearTimeout(id);
  }, [ready]);

  // Fire analyze exactly once — ref guard prevents React Strict Mode double-invoke
  useEffect(() => {
    if (docParam || hasCalledRef.current) return;
    hasCalledRef.current = true;
    analyze.mutate({ sampleId, fileId, fileName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On success: show results for 2.5s then navigate
  useEffect(() => {
    const id = docParam ?? analyze.data?.id ?? sampleId;
    if (!ready || !id) return;
    setStage(STEPS.length);

    if (analyze.data) {
      setShowResults(true);
      const timer = setTimeout(() => {
        setDirection('push');
        router.replace(`/v2/documents/${id}`);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setDirection('push');
        router.replace(`/v2/documents/${id}`);
      }, 200);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, docParam]);

  const doc = analyze.data;
  const matchedServices = doc
    ? GOV_SERVICES.filter((svc) =>
        svc.documents.some((req) => documentSatisfies(req.en, doc)),
      )
    : [];

  // Results screen — shown for 2.5s after successful analysis
  if (showResults && doc) {
    return (
      <div className="flex min-h-full flex-col gap-4 pt-4">
        <div className="flex items-center gap-3 rounded-[18px] bg-[#EDFDF4] p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#2E9B67] text-white">
            <Icon name="check" className="h-5 w-5" strokeWidth={3} />
          </span>
          <div>
            <p className="text-base font-bold text-[#101828]">Document analysed</p>
            <p className="text-sm text-[#6B7890]">Opening details…</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-[#EAF1FF] bg-white shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
          <div className="border-b border-[#EAF1FF] px-4 pt-4 pb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7890]">
              Detected document
            </p>
            <p className="mt-0.5 text-lg font-bold text-[#101828]">
              {doc.docType || 'Government Document'}
            </p>
          </div>
          {(doc.personal ?? []).slice(0, 4).map((field) => (
            <div
              key={field.label.en}
              className="flex items-center justify-between border-b border-[#EAF1FF] px-4 py-2.5 last:border-none"
            >
              <span className="text-sm text-[#6B7890]">{field.label.en}</span>
              <span className="max-w-[55%] truncate text-right text-sm font-semibold text-[#101828]">
                {field.sensitive ? '••••••' : field.value}
              </span>
            </div>
          ))}
        </div>

        {matchedServices.length > 0 && (
          <div className="rounded-[18px] border border-[#EAF1FF] bg-white p-4 shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7890]">
              Services you can apply for
            </p>
            <div className="flex flex-wrap gap-2">
              {matchedServices.slice(0, 4).map((svc) => (
                <span
                  key={svc.id}
                  className="rounded-full bg-[#EAF1FF] px-3 py-1 text-xs font-semibold text-[#173A78]"
                >
                  {svc.title.en}
                </span>
              ))}
              {matchedServices.length > 4 && (
                <span className="rounded-full bg-[#F0F4FF] px-3 py-1 text-xs font-semibold text-[#6B7890]">
                  +{matchedServices.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col items-center pt-6 text-center">
      <h1 className="v2-heading text-2xl font-extrabold text-[#101828]">
        {analyze.isError ? "Couldn't read this file" : 'Processing...'}
      </h1>

      <img
        src="/v2-assets/illustration-processing.svg"
        alt=""
        className="mt-6 h-44 w-44"
        draggable={false}
      />

      <h2 className="v2-heading mt-6 max-w-[18rem] text-xl font-bold leading-snug text-[#101828]">
        Extracting and understanding your document
      </h2>
      <p className="mt-2 text-base text-[#667085]">
        {showSlow
          ? 'This is taking a bit longer than usual — please wait…'
          : 'This may take a few seconds...'}
      </p>

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
        <div className="mt-5 w-full space-y-3">
          <p className="rounded-[14px] bg-[#FDE8EA] p-4 text-sm text-[#DC3545]">
            Something went wrong while reading this document. Please try again.
          </p>
          <button
            type="button"
            onClick={() => {
              setDirection('pop');
              router.replace('/v2/upload');
            }}
            className="w-full rounded-[14px] bg-[#173A78] px-4 py-3 text-base font-bold text-white active:translate-y-px"
          >
            Back to upload
          </button>
        </div>
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
