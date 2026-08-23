import { ICON_PATHS } from './icon-paths';
import { cn } from '@/lib/utils';

interface IconProps {
  name: string;
  className?: string;
  strokeWidth?: number;
}

/** The prototype's hand-drawn icon set, kept so the design is unchanged. */
export function Icon({ name, className = 'h-6 w-6', strokeWidth = 2 }: IconProps) {
  const paths = ICON_PATHS[name] ?? ICON_PATHS.info;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
