'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Actions live in the Applications tab. */
export default function V2ActionsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/v2/applications');
  }, [router]);
  return null;
}
