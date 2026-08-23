'use client';

/**
 * Slim banner shown when the government-data backend is unreachable
 * (GET /health fails). Non-invasive: renders nothing while healthy, so the UI
 * stays visually identical when the backend is up.
 */
import { useBackendHealth } from '@/hooks';
import { Icon } from './Icon';

// The collector is an optional, separate service. It is not included in the
// main project, so probing it on every screen would incorrectly make a normal
// installation look broken. Enable this only when that service is deployed.
const showCollectorStatus = process.env.NEXT_PUBLIC_ENABLE_GOV_SERVICE_STATUS === 'true';

export function BackendStatusBanner() {
  const { isError, isLoading } = useBackendHealth(showCollectorStatus);
  if (!showCollectorStatus || isLoading || !isError) return null;
  return (
    <div
      role="alert"
      className="flex items-center gap-2 bg-amberx-50 px-4 py-2 text-base font-medium text-amberx-700"
    >
      <Icon name="alert" className="h-5 w-5 shrink-0" />
      Government data service is unavailable. Retrying…
    </div>
  );
}
