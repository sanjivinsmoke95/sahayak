export type ShrinkStatus = 'ok' | 'partial' | 'untouched' | 'zipped' | 'failed';

export interface ShrinkOptions {
  /** null means "best quality", i.e. resize only. */
  targetBytes?: number | null;
  maxDim?: number;
}

export interface ShrinkResult {
  name: string;
  type: string;
  originalSize: number;
  kind: 'image' | 'file';
  status: ShrinkStatus;
  blob?: Blob;
  size?: number;
  width?: number;
  height?: number;
  sourceWidth?: number;
  sourceHeight?: number;
  quality?: number;
  outName?: string;
  outType?: string;
}

export interface SizeTarget {
  id: string;
  bytes: number;
  label: string;
}

/** One row in the shrink queue. */
export interface ShrinkEntry {
  id: string;
  file: File;
  /** Object URL of the original, for the hold-to-compare preview. */
  url: string | null;
}
