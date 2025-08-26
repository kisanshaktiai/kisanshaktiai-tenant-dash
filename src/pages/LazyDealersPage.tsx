
import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DealersPageContainer = lazy(() => 
  import('@/components/dealers/containers/DealersPageContainer').then(module => ({
    default: module.DealersPageContainer
  }))
);

const DealersPageSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  </div>
);

const LazyDealersPage = () => {
  return (
    <Suspense fallback={<DealersPageSkeleton />}>
      <DealersPageContainer />
    </Suspense>
  );
};

export default LazyDealersPage;
