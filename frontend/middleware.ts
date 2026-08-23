import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Clerk protects the app only once keys are present, so a fresh clone runs
 * without sign-in getting in the way. Add the keys and this starts enforcing.
 */
export default clerkEnabled ? clerkMiddleware() : () => NextResponse.next();

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico)).*)'],
};
