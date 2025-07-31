
import React from 'react';
import { useDashboardQuery } from '@/hooks/data/useDashboardQuery';
import { DashboardPresentation } from '../presentation/DashboardPresentation';

export const DashboardContainer: React.FC = () => {
  const { data: stats, isLoading, error } = useDashboardQuery();

  return (
    <DashboardPresentation
      stats={stats}
      isLoading={isLoading}
      error={error}
    />
  );
};
