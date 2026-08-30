'use client';

import { V2Header } from './V2Header';

/**
 * App bar for every standard V2 sub-page: just the shared {@link V2Header}
 * (supplied logo lockup + tricolour ribbon + profile shortcut), identical to
 * the home page. The logo doubles as the "up" affordance — tapping it returns
 * home — alongside the bottom tab bar.
 */
export function V2AppBar() {
  return <V2Header />;
}
