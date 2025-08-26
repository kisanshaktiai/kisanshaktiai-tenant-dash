
import React, { Suspense, memo } from 'react';
import { useOptimizedDashboardQuery } from '@/hooks/data/useOptimizedDashboardQuery';
import { MemoizedDashboardPresentation } from '../presentation/MemoizedDashboardPresentation';
import { DashboardSkeleton } from '../presentation/DashboardSkeleton';

const OptimizedDashboardContainer = memo(() => {
  const { data: stats, isLoading, error } = useOptimizedDashboardQuery();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <MemoizedDashboardPresentation
        stats={stats}
        isLoading={isLoading}
        error={error}
      />
    </Suspense>
  );
});

OptimizedDashboardContainer.displayName = 'OptimizedDashboardContainer';

export { OptimizedDashboardContainer };
