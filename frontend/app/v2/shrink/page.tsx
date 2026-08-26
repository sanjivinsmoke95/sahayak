'use client';

import { FilePickerTiles, SavingsSummary, ShrinkQueue, SizeTargetPicker } from '@/components/shrink';
import { useCompressor, useTranslation } from '@/hooks';

/**
 * On-device file compression, surfaced in the V2 shell. The control is the
 * portal's size limit ("upload your photo, under 200 KB"), not a quality slider.
 */
export default function V2ShrinkPage() {
  const { t } = useTranslation();
  const compressor = useCompressor();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="v2-heading text-2xl font-bold leading-snug text-[#101828]">{t('shrinkTitle')}</h1>
        <p className="mt-2 text-base leading-relaxed text-[#667085]">{t('shrinkSub')}</p>
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
