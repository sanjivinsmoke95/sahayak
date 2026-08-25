'use client';

/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Icon } from '@/components/common';
import { useAuthToken } from '@/hooks';
import { GOV_DOCUMENT_TARGET_BYTES, GOV_TARGET_LABEL } from '@/lib/gov-upload-limits';
import { filesService } from '@/services';
import { useUiStore } from '@/store';
import { shrinkFile } from '@/utils/compression';
import { buzz, humanBytes, isImageFile } from '@/utils/format';

export default function V2UploadPage() {
  const router = useRouter();
  const getToken = useAuthToken();
  const setDirection = useUiStore((s) => s.setDirection);
  const [busy, setBusy] = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  const handle = async (file: File | null | undefined) => {
    if (!file || busy) return;
    setBusy(true);
    try {
      let blob: Blob = file;
      let name = file.name;
      let reduced: { from: number; to: number } | null = null;

      // Compress image uploads down to the government document limit (500 KB).
      if (isImageFile(file) && file.size > GOV_DOCUMENT_TARGET_BYTES) {
        const result = await shrinkFile(file, { targetBytes: GOV_DOCUMENT_TARGET_BYTES });
        const outSize = result.size ?? file.size;
        if (result.blob && outSize < file.size) {
          blob = result.blob;
          name = result.outName ?? file.name;
          reduced = { from: file.size, to: outSize };
          toast.success(
            `Reduced ${humanBytes(reduced.from)} → ${humanBytes(reduced.to)} to meet government upload limits`,
          );
        }
      }

      const uploaded = await filesService.upload(
        { blob, name, originalSize: file.size },
        await getToken(),
      );

      const q = new URLSearchParams({ fileId: uploaded.id, name });
      if (reduced) {
        q.set('from', String(reduced.from));
        q.set('to', String(reduced.to));
      }
      setDirection('push');
      router.push(`/v2/analyzing?${q.toString()}`);
    } catch {
      toast.error('Could not upload the document. Make sure the backend is running.');
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col items-center">
        {/* Illustration */}
        <img
          src="/v2-assets/illustration-upload.svg"
          alt=""
          className="mt-4 h-52 w-52"
          draggable={false}
        />

        <h1 className="v2-heading mt-2 text-2xl font-extrabold text-[#101828]">Upload your document</h1>
        <p className="mt-2 max-w-[16rem] text-center text-base leading-relaxed text-[#667085]">
          We&apos;ll read it and explain in simple words.
        </p>

        {/* Actions */}
        <div className="mt-7 w-full space-y-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => { buzz(); galleryRef.current?.click(); }}
            className="flex w-full items-center justify-center gap-2.5 rounded-[16px] bg-[#102D63] px-4 py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(16,40,99,0.22)] transition active:translate-y-px disabled:opacity-60"
          >
            <Icon name="upload" className="h-5 w-5" />
            {busy ? 'Uploading…' : 'Choose from Gallery'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => { buzz(); scanRef.current?.click(); }}
            className="flex w-full items-center justify-center gap-2.5 rounded-[16px] border border-[#F4A340] bg-[#FFF9F0] px-4 py-4 text-base font-bold text-[#B5760F] active:bg-[#FFF3E3] disabled:opacity-60"
          >
            <Icon name="camera" className="h-5 w-5" />
            Scan Document
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-[#667085]">
          Supported formats: PDF, PNG, JPG
          <br />
          Photos are auto-compressed to meet government limits (≤ {GOV_TARGET_LABEL})
        </p>

        <input
          ref={galleryRef}
          type="file"
          accept="image/*,application/pdf"
          className="sr-only"
          onChange={(e) => { void handle(e.target.files?.[0]); e.target.value = ''; }}
        />
        <input
          ref={scanRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => { void handle(e.target.files?.[0]); e.target.value = ''; }}
        />
      </div>

      {/* Safety note */}
      <div className="mt-6 flex items-start gap-3 rounded-[18px] bg-[#EAF1FF] p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#102D63]">
          <Icon name="info" className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-[#102D63]">Your data is safe with us.</p>
          <p className="mt-0.5 text-sm leading-relaxed text-[#667085]">
            We never share your documents with anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
