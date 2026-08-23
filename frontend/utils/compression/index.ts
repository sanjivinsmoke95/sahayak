import { MAX_DIMENSION_BEST, MAX_DIMENSION_TARGETED } from '@/lib/constants';
import type { ShrinkOptions, ShrinkResult } from '@/types';
import { isImageFile, renameFile } from '@/utils/format';
import { bestQuality, fitUnder, loadPicture } from './image';
import { gzipFile } from './gzip';

export * from './image';
export * from './gzip';

/**
 * The single entry point the UI calls. Nothing here touches the network:
 * these files are Aadhaar cards and bank passbooks, and they stay put.
 */
export async function shrinkFile(file: File, opts: ShrinkOptions = {}): Promise<ShrinkResult> {
  const targetBytes = opts.targetBytes ?? null;
  const maxDim = opts.maxDim ?? (targetBytes ? MAX_DIMENSION_TARGETED : MAX_DIMENSION_BEST);

  const base = {
    name: file.name,
    type: file.type,
    originalSize: file.size,
    kind: isImageFile(file) ? ('image' as const) : ('file' as const),
  };

  if (isImageFile(file)) {
    // Already under the portal's limit? Re-encoding would throw away detail
    // and buy nothing, so leave the file exactly as it is.
    if (targetBytes && file.size <= targetBytes) {
      return { ...base, status: 'untouched', blob: file, size: file.size, outName: file.name };
    }

    let pic = null;
    try {
      pic = await loadPicture(file);
      const out = targetBytes
        ? await fitUnder(pic, targetBytes, maxDim)
        : await bestQuality(pic, maxDim);
      if (!out) return { ...base, status: 'failed' };

      if (out.blob.size >= file.size && !targetBytes) {
        return {
          ...base, status: 'untouched', blob: file, size: file.size,
          width: pic.width, height: pic.height, outName: file.name,
        };
      }

      return {
        ...base,
        status: out.reachedTarget ? 'ok' : 'partial',
        blob: out.blob,
        size: out.blob.size,
        width: out.width,
        height: out.height,
        sourceWidth: pic.width,
        sourceHeight: pic.height,
        quality: out.quality,
        outName: renameFile(file.name, '-small', 'jpg'),
        outType: 'image/jpeg',
      };
    } catch {
      return { ...base, status: 'failed' };
    } finally {
      pic?.release();
    }
  }

  try {
    const packed = await gzipFile(file);
    if (!packed) return { ...base, status: 'failed' };
    if (packed.size >= file.size) {
      return { ...base, status: 'untouched', blob: file, size: file.size, outName: file.name };
    }
    return {
      ...base, status: 'zipped', blob: packed, size: packed.size,
      outName: `${file.name}.gz`, outType: 'application/gzip',
    };
  } catch {
    return { ...base, status: 'failed' };
  }
}

export function saveBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function shareBlob(blob: Blob, name: string, type?: string): Promise<boolean> {
  if (!navigator.share || !navigator.canShare) return false;
  try {
    const file = new File([blob], name, { type: type || blob.type });
    if (!navigator.canShare({ files: [file] })) return false;
    await navigator.share({ files: [file], title: name });
    return true;
  } catch {
    return false;
  }
}
