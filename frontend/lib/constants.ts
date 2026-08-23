import type { SizeTarget } from '@/types';

/** Upload ceilings enforced by most Indian government portals. */
export const SIZE_TARGETS: SizeTarget[] = [
  { id: 'p100', bytes: 100 * 1024,  label: '100 KB' },
  { id: 'p200', bytes: 200 * 1024,  label: '200 KB' },
  { id: 'p500', bytes: 500 * 1024,  label: '500 KB' },
  { id: 'p1m',  bytes: 1024 * 1024, label: '1 MB'   }
];

export const KB = 1024;
export const MB = 1024 * 1024;

/** A weak rural 2G/3G link moves roughly this many bytes per second. */
export const SLOW_LINK_BPS = 50 * KB;

/** Below this JPEG quality small print starts to smear. */
export const QUALITY_FLOOR = 0.6;

/** Longest edge kept when fitting to a size target. */
export const MAX_DIMENSION_TARGETED = 2400;
export const MAX_DIMENSION_BEST = 2000;

/** Photos larger than this are auto-shrunk on upload when the setting is on. */
export const AUTO_SHRINK_THRESHOLD = 900 * KB;
export const AUTO_SHRINK_TARGET = MB;

export const TAB_ROUTES = ['/', '/documents', '/schemes', '/applications', '/assistant'] as const;

export const QUERY_KEYS = {
  documents: ['documents'] as const,
  document: (id: string) => ['documents', id] as const,
  checklists: ['checklists'] as const,
  settings: ['settings'] as const,
  chats: ['chats'] as const,
  chat: (id: string) => ['chats', id] as const,
  files: ['files'] as const,
  aiModels: ['ai-models'] as const,
} as const;
