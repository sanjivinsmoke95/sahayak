'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AUTO_SHRINK_TARGET, AUTO_SHRINK_THRESHOLD } from '@/lib/constants';
import { filesService } from '@/services';
import { useSettingsStore } from '@/store';
import { shrinkFile } from '@/utils/compression';
import { fill, humanBytes, isImageFile } from '@/utils/format';
import { useAuthToken } from './useAuthToken';
import { useTranslation } from './useTranslation';

/**
 * Every photo picked anywhere in the app passes through here, so compression
 * is not something the user has to remember to use.
 */
export function useDocumentUpload() {
  const router = useRouter();
  const { t } = useTranslation();
  const getToken = useAuthToken();
  const autoShrink = useSettingsStore((s) => s.autoShrink);
  const [busy, setBusy] = useState(false);

  const handleFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      setBusy(true);
      try {
        let blob: Blob = file;
        let name = file.name;

        if (autoShrink && isImageFile(file) && file.size > AUTO_SHRINK_THRESHOLD) {
          const result = await shrinkFile(file, { targetBytes: AUTO_SHRINK_TARGET });
          if (result.blob && (result.size ?? file.size) < file.size) {
            blob = result.blob;
            name = result.outName ?? file.name;
            toast.success(
              fill(t('autoShrunk'), {
                old: humanBytes(result.originalSize),
                new: humanBytes(result.size ?? 0),
              }),
            );
          }
        }

        const uploaded = await filesService.upload(
          { blob, name, originalSize: file.size },
          await getToken(),
        );
        router.push(`/analyzing?fileId=${uploaded.id}&name=${encodeURIComponent(name)}`);
      } catch {
        // Do not hide an upload failure behind a sample-analysis screen.
        toast.error('Could not upload the document. Make sure the backend and database are running.');
      } finally {
        setBusy(false);
      }
    },
    [autoShrink, getToken, router, t],
  );

  return { handleFile, busy };
}
