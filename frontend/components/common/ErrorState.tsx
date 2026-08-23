/** Reusable error panel with an optional retry, styled like EmptyState. */
import { Icon } from './Icon';
import { RetryButton } from './RetryButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-xl2 border border-red-100 bg-white p-7 text-center shadow-soft">
      <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-600">
        <Icon name="alert" className="h-8 w-8" />
      </span>
      <p className="text-lg font-semibold">{title}</p>
      {message && <p className="mt-1 text-base text-muted">{message}</p>}
      {onRetry && (
        <div className="mt-5 flex justify-center">
          <RetryButton onRetry={onRetry} />
        </div>
      )}
    </div>
  );
}
