'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Actions were consolidated into the Applications tab. */
export default function ActionsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/applications');
  }, [router]);
  return null;
}
