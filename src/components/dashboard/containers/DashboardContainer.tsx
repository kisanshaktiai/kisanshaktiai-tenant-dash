
import React, { Suspense, lazy } from 'react';
import { useDashboardQuery } from '@/hooks/data/useDashboardQuery';
import { DashboardSkeleton } from '../presentation/DashboardSkeleton';

// Lazy load the heavy DashboardPresentation component
const DashboardPresentation = lazy(() => 
  import('../presentation/DashboardPresentation').then(module => ({
    default: module.DashboardPresentation
  }))
);

export const DashboardContainer: React.FC = () => {
  const { data: stats, isLoading, error } = useDashboardQuery();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPresentation
        stats={stats}
        isLoading={isLoading}
        error={error}
      />
    </Suspense>
  );
};
