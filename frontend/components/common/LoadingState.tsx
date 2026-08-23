/** Reusable loading skeleton — same card frame as real content, so the layout
 *  does not jump when data arrives. */
interface LoadingStateProps {
  rows?: number;
  label?: string;
}

export function LoadingState({ rows = 3, label }: LoadingStateProps) {
  return (
    <div className="space-y-2.5" role="status" aria-busy="true" aria-label={label ?? 'Loading'}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3.5 rounded-2xl border border-navy-100 bg-white p-4 shadow-soft"
        >
          <span className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-navy-100" />
          <span className="min-w-0 flex-1 space-y-2">
            <span className="block h-4 w-2/3 animate-pulse rounded bg-navy-100" />
            <span className="block h-3 w-1/3 animate-pulse rounded bg-navy-50" />
          </span>
        </div>
      ))}
    </div>
  );
}
