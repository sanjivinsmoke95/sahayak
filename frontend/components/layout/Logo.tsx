import { cn } from '@/lib/utils';

export function Logo({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('grid shrink-0 place-items-center rounded-2xl bg-navy-600 text-white', className)}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-2/3 w-2/3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V4a.5.5 0 0 1 1-.5z" />
        <path d="M9 13l2.2 2.2L16 10.5" />
      </svg>
    </span>
  );
}
