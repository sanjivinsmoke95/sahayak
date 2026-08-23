export const canGzip = (): boolean =>
  typeof window !== 'undefined' && typeof window.CompressionStream === 'function';

/**
 * Packs any file with gzip. The result is a .gz, so it is for sending and
 * storing rather than uploading to a portal — callers must say so.
 *
 * Feeds the writer directly rather than piping file.stream(), because some
 * Safari versions ship CompressionStream without Blob.stream().
 */
export async function gzipFile(file: File): Promise<Blob | null> {
  if (!canGzip()) return null;
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  const bytes = new Uint8Array(await file.arrayBuffer());
  void writer.write(bytes);
  void writer.close();
  const out = await new Response(cs.readable).arrayBuffer();
  return new Blob([out], { type: 'application/gzip' });
}
