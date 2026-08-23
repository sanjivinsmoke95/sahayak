'use client';

import { useState, type ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Clerk is mounted only when a publishable key exists, so a fresh clone runs
 * without any auth configuration. Add the keys to .env.local and sign-in
 * switches on with no code change.
 */
function MaybeClerk({ children }: { children: ReactNode }) {
  if (!clerkKey) return <>{children}</>;
  return <ClerkProvider publishableKey={clerkKey}>{children}</ClerkProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <MaybeClerk>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="bottom-center" richColors closeButton={false} />
      </QueryClientProvider>
    </MaybeClerk>
  );
}
