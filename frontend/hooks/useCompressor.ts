'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SIZE_TARGETS } from '@/lib/constants';
import type { ShrinkEntry, ShrinkResult } from '@/types';
import { shrinkFile } from '@/utils/compression';
import { buzz, isImageFile } from '@/utils/format';

type ResultMap = Record<string, 'working' | ShrinkResult>;

let seq = 0;
const uid = () => `f${(seq += 1)}-${Date.now().toString(36)}`;

/**
 * Owns the shrink queue: object URLs, sequential processing, and re-running
 * everything when the size limit changes. Kept out of the component so the
 * screen stays presentational.
 */
export function useCompressor(initialTarget = 'p500') {
  const [target, setTarget] = useState(initialTarget);
  const [entries, setEntries] = useState<ShrinkEntry[]>([]);
  const [results, setResults] = useState<ResultMap>({});

  const runToken = useRef(0);
  const outUrls = useRef<Record<string, string | null>>({});

  useEffect(() => {
    if (!entries.length) return;
    const token = (runToken.current += 1);
    const chosen = SIZE_TARGETS.find((s) => s.id === target);

    setResults(Object.fromEntries(entries.map((e) => [e.id, 'working' as const])));

    void (async () => {
      // Sequential on purpose: decoding several 12 MP photos at once is how
      // you crash a cheap phone.
      for (const entry of entries) {
        if (runToken.current !== token) return;
        const result = await shrinkFile(entry.file, {
          targetBytes: chosen ? chosen.bytes : null,
        });
        if (runToken.current !== token) return;

        const previous = outUrls.current[entry.id];
        if (previous) URL.revokeObjectURL(previous);
        outUrls.current[entry.id] =
          result.blob && result.kind === 'image' ? URL.createObjectURL(result.blob) : null;

        setResults((prev) => ({ ...prev, [entry.id]: result }));
        buzz(6);
      }
    })();
  }, [entries, target]);

  useEffect(
    () => () => {
      runToken.current += 1;
      Object.values(outUrls.current).forEach((url) => url && URL.revokeObjectURL(url));
    },
    [],
  );

  const addFiles = useCallback((files: File[]) => {
    if (!files.length) return;
    buzz(12);
    setEntries((prev) =>
      [
        ...prev,
        ...files.map((file) => ({
          id: uid(),
          file,
          url: isImageFile(file) ? URL.createObjectURL(file) : null,
        })),
      ].slice(-10),
    );
  }, []);

  const clear = useCallback(() => {
    runToken.current += 1;
    setEntries((prev) => {
      prev.forEach((e) => e.url && URL.revokeObjectURL(e.url));
      return [];
    });
    Object.values(outUrls.current).forEach((url) => url && URL.revokeObjectURL(url));
    outUrls.current = {};
    setResults({});
  }, []);

  const finished = entries
    .map((e) => results[e.id])
    .filter((r): r is ShrinkResult => !!r && r !== 'working');

  return {
    target,
    setTarget,
    entries,
    results,
    outUrls: outUrls.current,
    addFiles,
    clear,
    savedBytes: finished.reduce(
      (n, r) => n + Math.max(0, r.originalSize - (r.size ?? r.originalSize)),
      0,
    ),
    totalBefore: finished.reduce((n, r) => n + r.originalSize, 0),
    totalAfter: finished.reduce((n, r) => n + (r.size ?? r.originalSize), 0),
  };
}
