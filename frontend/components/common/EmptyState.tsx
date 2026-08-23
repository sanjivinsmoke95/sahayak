import { Button } from '@/components/ui';
import { Icon } from './Icon';

interface EmptyStateProps {
  icon: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-xl2 border border-navy-100 bg-white p-7 text-center shadow-soft">
      <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-navy-50 text-navy-600">
        <Icon name={icon} className="h-8 w-8" />
      </span>
      <p className="text-lg leading-relaxed text-muted">{title}</p>
      {actionLabel && onAction && (
        <Button size="md" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
