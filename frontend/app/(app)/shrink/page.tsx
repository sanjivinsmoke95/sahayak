'use client';

import { FilePickerTiles, SavingsSummary, ShrinkQueue, SizeTargetPicker } from '@/components/shrink';
import { useCompressor, useTranslation } from '@/hooks';

/**
 * File compression, entirely on the device. The control is the portal's size
 * limit rather than a quality slider, because that is the number people are
 * actually given: "upload your photo, under 200 KB".
 */
export default function ShrinkPage() {
  const { t } = useTranslation();
  const compressor = useCompressor();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold leading-snug">{t('shrinkTitle')}</h1>
        <p className="mt-2 text-lg leading-relaxed text-muted">{t('shrinkSub')}</p>
      </header>

      <SizeTargetPicker value={compressor.target} onChange={compressor.setTarget} />
      <FilePickerTiles onFiles={compressor.addFiles} />

      <SavingsSummary
        savedBytes={compressor.savedBytes}
        totalBefore={compressor.totalBefore}
        totalAfter={compressor.totalAfter}
      />

      <ShrinkQueue
        entries={compressor.entries}
        results={compressor.results}
        outUrls={compressor.outUrls}
        onClear={compressor.clear}
      />
    </div>
  );
}
