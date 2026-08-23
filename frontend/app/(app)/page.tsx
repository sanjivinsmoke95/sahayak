'use client';

import {
  AppFooter,
  GreetingHero,
  HomeQuickActions,
  NeedsAttention,
  RecentDocuments,
} from '@/components/home';

export default function HomePage() {
  return (
    <>
      <div className="space-y-6">
        <GreetingHero />
        <NeedsAttention />
        <RecentDocuments />
        <HomeQuickActions />
      </div>
      <AppFooter />
    </>
  );
}
