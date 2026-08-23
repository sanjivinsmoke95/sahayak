import { Button } from '@/components/ui';

interface RetryButtonProps {
  onRetry: () => void;
  label?: string;
}

export function RetryButton({ onRetry, label = 'Try again' }: RetryButtonProps) {
  return (
    <Button size="md" variant="secondary" onClick={onRetry}>
      {label}
    </Button>
  );
}
