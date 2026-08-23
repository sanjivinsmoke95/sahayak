import { AUTO_SHRINK_TARGET, AUTO_SHRINK_THRESHOLD } from '@/lib/constants';
import { documentsService, filesService } from '@/services';
import type { SahayakDocument } from '@/types';
import { shrinkFile } from '@/utils/compression';
import { isImageFile } from '@/utils/format';

/**
 * The one place a picked file becomes an analysed document: optional on-device
 * shrink, upload, then analyse. Every inline uploader (chat, service slots)
 * goes through here so there is a single upload+analyse path to reason about.
 */
export async function analyzeUploadedFile(
  file: File,
  opts: { autoShrink: boolean; token?: string | null },
): Promise<SahayakDocument> {
  let blob: Blob = file;
  let name = file.name;

  if (opts.autoShrink && isImageFile(file) && file.size > AUTO_SHRINK_THRESHOLD) {
    const shrunk = await shrinkFile(file, { targetBytes: AUTO_SHRINK_TARGET });
    if (shrunk.blob && (shrunk.size ?? file.size) < file.size) {
      blob = shrunk.blob;
      name = shrunk.outName ?? file.name;
    }
  }

  const uploaded = await filesService.upload({ blob, name, originalSize: file.size }, opts.token);
  return documentsService.analyze({ fileId: uploaded.id, fileName: name }, opts.token);
}

/** Classification confidence thresholds shared by the inline uploaders. */
export const CONFIDENCE = {
  /** Below this we won't name a document type. */
  unsureBelow: 0.45,
  /** At/above this a "not a government document" verdict is stated plainly. */
  notGovAbove: 0.55,
} as const;

export type UploadVerdict = 'ok' | 'unsure' | 'not-government';

/** Turn an analysed document's classification into a decision. */
export function classifyVerdict(doc: SahayakDocument): UploadVerdict {
  const confidence = doc.confidence ?? 1;
  const isGovernment = doc.isGovernment ?? true;
  if (confidence < CONFIDENCE.unsureBelow) return 'unsure';
  if (!isGovernment && confidence >= CONFIDENCE.notGovAbove) return 'not-government';
  return 'ok';
}
