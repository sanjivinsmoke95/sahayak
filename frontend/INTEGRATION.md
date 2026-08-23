# Frontend ↔ Backend Integration

Connects the existing React (Next.js) app to the **government-data API** (the
collector: `/services`, `/services/{id}`, `/services/{id}/history`, `/search`,
`/stats`, `/health`, `/crawl`, and a prepared `/chat`). The UI, pages, layouts
and components are unchanged — only the data source is now live.

## Configuration (no hardcoded URLs)

`.env.local` (or `.env`):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000   # the collector / data API
```

> This app is Next.js, so the browser-exposed variable is `NEXT_PUBLIC_*`
> (the Vite `VITE_*` name from the brief maps to this). It is read once in
> `lib/api/client.ts`.

## What was added (all additive — nothing removed)

```
lib/api/
  client.ts     one Axios instance: baseURL, timeout, request/response
                logging interceptors, global error → ApiError normalisation
  services.ts   list (paginated/filtered) · getById · history
  search.ts     keyword | semantic | hybrid search with filters
  stats.ts      GET /stats
  health.ts     GET /health
  crawler.ts    POST /crawl
  chat.ts       POST /chat  (placeholder integration; chat UI untouched)
  index.ts      barrel

types/services.ts     interfaces for EVERY backend response (no `any`)

hooks/useDebouncedValue.ts
hooks/useGovServices.ts   React Query hooks:
     useServices · useService · useServiceHistory · useStats
     useBackendHealth · useSearchServices (debounced) · useTriggerCrawl

components/common/
  LoadingState.tsx  skeletons   ErrorState.tsx  RetryButton.tsx
  BackendStatusBanner.tsx  (mounted in AppBar next to OfflineBanner)
  (EmptyState already existed and is reused)
```

`services/gov-services.service.ts` now delegates to the Axios layer (same
signatures). React Query is already configured in `app/providers.tsx`.

## Live behaviour shipped

- **Backend health / offline banner** — `BackendStatusBanner` polls `/health`
  every 30s and shows a slim banner only when the data API is unreachable
  (renders nothing while healthy, so the UI is visually identical).

## Using live data in any page (drop-in, UI unchanged)

Every hook gives caching, retry, background refetch and typed data:

```tsx
import { useServices } from '@/hooks';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';

function ServicesList() {
  const { data, isLoading, isError, refetch } = useServices({ limit: 20 });
  if (isLoading) return <LoadingState rows={5} />;
  if (isError)   return <ErrorState onRetry={() => refetch()} />;
  if (!data?.results.length) return <EmptyState icon="doc" title="No services yet" />;
  return <>{data.results.map((s) => /* your existing card */ null)}</>;
}
```

Search (debounced, with loading + no-results states):

```tsx
const { data, isLoading, isTyping } = useSearchServices(query, { mode: 'hybrid' });
```

Home stats:

```tsx
const { data } = useStats();
// data.total_services, Object.keys(data.by_state).length states, data.by_language
```

## Note on mock data

`lib/data/sample-documents.ts` was intentionally **kept**: it powers the
existing `/analyzing` demo flow (an existing page). Removing it would break that
page, which the "keep all existing pages" rule forbids. The hooks above make
live `/services` data available to render wherever you want it — swapping a
consumer to `useServices()` is a one-liner and keeps the same card UI.

## Verify

```bash
npm install       # adds axios
npm run typecheck  # tsc --noEmit → passes with 0 errors
npm run dev        # set NEXT_PUBLIC_API_BASE_URL and run the collector API
```
