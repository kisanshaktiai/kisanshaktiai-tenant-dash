
import React from 'react';
import { useEnhancedRealtimeDashboard } from '@/hooks/data/useEnhancedRealtimeDashboard';
import { Modern2025DashboardPresentation } from '../presentation/Modern2025DashboardPresentation';

export const DashboardContainer: React.FC = () => {
  const { data, isLoading, error, isLive, lastUpdate } = useEnhancedRealtimeDashboard();

  return (
    <Modern2025DashboardPresentation
      data={data}
      isLoading={isLoading}
      error={error}
      isLive={isLive}
      lastUpdate={lastUpdate}
    />
  );
};
