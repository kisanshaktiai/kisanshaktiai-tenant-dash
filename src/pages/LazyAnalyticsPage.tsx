
import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AnalyticsPageContainer = lazy(() => 
  import('@/components/analytics/containers/AnalyticsPageContainer').then(module => ({
    default: module.AnalyticsPageContainer
  }))
);

const AnalyticsPageSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full" />
      ))}
    </div>
  </div>
);

const LazyAnalyticsPage = () => {
  return (
    <Suspense fallback={<AnalyticsPageSkeleton />}>
      <AnalyticsPageContainer />
    </Suspense>
  );
};

export default LazyAnalyticsPage;
