'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { SectionCard } from '@/components/common';
import { Button } from '@/components/ui';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import type { SahayakDocument } from '@/types';

/**
 * The actual uploaded PDF or image — previewed, and available to view full
 * screen, share (native Web Share where supported) or download. This is the
 * real file, never the OCR text; the extracted wording stays separate and
 * secondary.
 */
export function OriginalFile({ document: doc }: { document: SahayakDocument }) {
  const { t } = useTranslation();
  const [sharing, setSharing] = useState(false);

  const file = doc.originalFile;
  if (!file) return null;

  const url = `/api/documents/${doc.id}/file`;
  const isImage = file.mime?.startsWith('image/');
  const isPdf = file.mime === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  const download = () => {
    const link = window.document.createElement('a');
    link.href = url;
    link.download = file.name;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const share = async () => {
    setSharing(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const shareFile = new File([blob], file.name, { type: file.mime || blob.type });
      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
        share?: (data: unknown) => Promise<void>;
      };
      if (nav.share && (!nav.canShare || nav.canShare({ files: [shareFile] }))) {
        await nav.share({ files: [shareFile], title: file.name });
      } else {
        // No native file share: fall back to a download rather than a dead button.
        download();
        toast(t('fileShareFail'));
      }
    } catch (err) {
      // A user cancelling the share sheet is not an error worth surfacing.
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        download();
        toast(t('fileShareFail'));
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <SectionCard icon="doc" tone="navy" title={t('fileTitle')}>
      <div className="mb-3 overflow-hidden rounded-xl border border-navy-100 bg-navy-50">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={file.name} className="max-h-72 w-full object-contain" />
        ) : isPdf ? (
          <iframe src={url} title={file.name} className="h-72 w-full" />
        ) : (
          <div className="flex items-center gap-2 p-4 text-muted">
            <Icon name="doc" className="h-5 w-5" />
            <span className="truncate text-sm">{file.name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button size="sm" variant="secondary" onClick={() => window.open(url, '_blank', 'noopener')}>
          <Icon name="doc" className="h-4 w-4" />
          {t('fileView')}
        </Button>
        <Button size="sm" variant="secondary" disabled={sharing} onClick={share}>
          <Icon name="share" className="h-4 w-4" />
          {t('fileShare')}
        </Button>
        <Button size="sm" variant="secondary" onClick={download}>
          <Icon name="save" className="h-4 w-4" />
          {t('fileDownload')}
        </Button>
      </div>
    </SectionCard>
  );
}
