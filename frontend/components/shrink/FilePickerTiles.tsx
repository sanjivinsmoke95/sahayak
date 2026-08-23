'use client';

import { useRef } from 'react';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';

export function FilePickerTiles({ onFiles }: { onFiles: (files: File[]) => void }) {
  const { t } = useTranslation();
  const cameraRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);

  const handle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="flex h-32 flex-col items-center justify-center gap-2.5 rounded-xl2 bg-navy-600 px-2 text-white shadow-lift active:translate-y-px"
        >
          <Icon name="camera" className="h-8 w-8" />
          <span className="text-center text-base font-bold leading-tight">{t('shrinkPhoto')}</span>
        </button>
        <button
          type="button"
          onClick={() => filesRef.current?.click()}
          className="flex h-32 flex-col items-center justify-center gap-2.5 rounded-xl2 border-2 border-dashed border-navy-200 bg-white px-2 text-navy-700 active:bg-navy-50"
        >
          <Icon name="upload" className="h-8 w-8" />
          <span className="text-center text-base font-bold leading-tight">{t('shrinkPick')}</span>
        </button>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handle} />
        <input ref={filesRef} type="file" multiple className="sr-only" onChange={handle} />
      </div>

      <p className="flex items-center justify-center gap-2 text-base text-leaf-700">
        <Icon name="lock" className="h-4 w-4 shrink-0" />
        {t('upSafe')}
      </p>
    </>
  );
}
