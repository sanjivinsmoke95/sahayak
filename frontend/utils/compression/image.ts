import { QUALITY_FLOOR } from '@/lib/constants';

/**
 * Image compression, entirely on the device.
 *
 * Two dials matter: how many pixels, and how hard the JPEG encoder squeezes
 * each one. Dropping quality alone turns small print to porridge long before
 * a 12 MP photo reaches 100 KB, so we step resolution down a ladder and, at
 * each rung, binary-search the highest quality that still fits. The widest
 * rung that encodes above QUALITY_FLOOR wins.
 *
 * Output is JPEG deliberately. WebP and AVIF compress better, but a great
 * many government upload forms still reject anything that is not JPG, PNG or
 * PDF, and a rejected upload helps nobody.
 */

export interface DecodedPicture {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

/** One completed encode at a particular size and quality. */
export interface EncodeAttempt {
  blob: Blob;
  quality: number;
  width: number;
  height: number;
}

export interface EncodedImage extends EncodeAttempt {
  /** False when the file could not be squeezed under the limit at all. */
  reachedTarget: boolean;
}

export async function loadPicture(file: File): Promise<DecodedPicture> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bmp, width: bmp.width, height: bmp.height, release: () => bmp.close?.() };
    } catch {
      /* Older Safari: fall through to the <img> path. */
    }
  }
  return new Promise<DecodedPicture>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () =>
      resolve({
        source: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        release: () => URL.revokeObjectURL(url),
      });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not decode this image'));
    };
    img.src = url;
  });
}

function paint(source: CanvasImageSource, w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable');
  // JPEG has no transparency, and black behind a scanned form would ruin it.
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

const toBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', quality));

const LADDER = [1, 0.85, 0.72, 0.6, 0.5, 0.42, 0.34, 0.27, 0.21, 0.16];

export async function fitUnder(
  pic: DecodedPicture,
  targetBytes: number,
  maxDim: number,
): Promise<EncodedImage | null> {
  const cap = Math.min(1, maxDim / Math.max(pic.width, pic.height));

  // Tracked alongside plain numbers rather than by comparing through the
  // nullable objects, which reads more directly and keeps the narrowing simple.
  // Stored ready to return, so nothing has to be reassembled afterwards.
  let best: EncodedImage | null = null;
  let bestQuality = -1;
  let fallback: EncodedImage | null = null;
  let fallbackSize = Number.POSITIVE_INFINITY;

  for (const rung of LADDER) {
    const scale = cap * rung;
    const w = pic.width * scale;
    const h = pic.height * scale;
    if (w < 240 && h < 240 && (best || fallback)) break; // too small to read

    const canvas = paint(pic.source, w, h);
    let lo = 0.3;
    let hi = 0.94;
    let hit: EncodeAttempt | null = null;

    for (let i = 0; i < 7; i += 1) {
      const q = (lo + hi) / 2;
      // eslint-disable-next-line no-await-in-loop
      const blob = await toBlob(canvas, q);
      if (blob && blob.size <= targetBytes) {
        hit = { blob, quality: q, width: canvas.width, height: canvas.height };
        lo = q;
      } else {
        hi = q;
        // Keep the smallest thing we managed to produce, in case nothing fits.
        if (blob && blob.size < fallbackSize) {
          fallback = {
            blob, quality: q, width: canvas.width, height: canvas.height,
            reachedTarget: false,
          };
          fallbackSize = blob.size;
        }
      }
    }

    if (hit) {
      const attempt: EncodedImage = { ...hit, reachedTarget: true };

      // Widest rung that still encodes above the legibility floor wins
      // outright: pixels are what make small print readable.
      if (attempt.quality >= QUALITY_FLOOR) return attempt;

      if (attempt.quality > bestQuality) {
        best = attempt;
        bestQuality = attempt.quality;
      }
    }
  }

  return best ?? fallback;
}

export async function bestQuality(pic: DecodedPicture, maxDim: number): Promise<EncodedImage> {
  const scale = Math.min(1, maxDim / Math.max(pic.width, pic.height));
  const canvas = paint(pic.source, pic.width * scale, pic.height * scale);
  const blob = await toBlob(canvas, 0.82);
  if (!blob) throw new Error('Could not encode this image');
  return { blob, quality: 0.82, width: canvas.width, height: canvas.height, reachedTarget: true };
}
