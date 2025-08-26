
import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const FarmersPageContainer = lazy(() => 
  import('@/components/farmers/containers/FarmersPageContainer').then(module => ({
    default: module.FarmersPageContainer
  }))
);

const FarmersPageSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
    <Skeleton className="h-96 w-full" />
  </div>
);

const LazyFarmersPage = () => {
  return (
    <Suspense fallback={<FarmersPageSkeleton />}>
      <FarmersPageContainer />
    </Suspense>
  );
};

export default LazyFarmersPage;
