'use client';

import { useRef } from 'react';
import { Icon } from '@/components/common';
import { useDocumentUpload, useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';
import { buzz } from '@/utils/format';

interface Tile {
  icon: string;
  label: string;
  accept: string;
  capture?: 'environment';
  primary?: boolean;
}

export function UploadTiles() {
  const { t } = useTranslation();
  const { handleFile } = useDocumentUpload();
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const tiles: Tile[] = [
    { icon: 'camera', label: t('btnPhoto'), accept: 'image/*', capture: 'environment', primary: true },
    { icon: 'upload', label: t('upPdf'), accept: 'application/pdf' },
    { icon: 'image', label: t('upImage'), accept: 'image/*' },
  ];

  return (
    <div className="space-y-3">
      {tiles.map((tile, index) => (
        <div key={tile.label}>
          <button
            type="button"
            onClick={() => {
              buzz();
              refs[index].current?.click();
            }}
            className={cn(
              'flex w-full items-center gap-4 rounded-xl2 p-4 transition active:translate-y-px',
              tile.primary
                ? 'bg-navy-600 text-white shadow-lift'
                : 'border-2 border-dashed border-navy-200 bg-white text-navy-700 active:bg-navy-50',
            )}
          >
            <span
              className={cn(
                'grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl',
                tile.primary ? 'bg-white/15' : 'bg-navy-50 text-navy-600',
              )}
            >
              <Icon name={tile.icon} className="h-7 w-7" />
            </span>
            <span className="text-left text-lg font-bold">{tile.label}</span>
          </button>
          <input
            ref={refs[index]}
            type="file"
            accept={tile.accept}
            capture={tile.capture}
            className="sr-only"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      ))}
    </div>
  );
}
