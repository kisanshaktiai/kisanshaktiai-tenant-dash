import React from 'react';
import { useEnhancedRealtimeDashboard } from '@/hooks/data/useEnhancedRealtimeDashboard';
import { Modern2025DashboardPresentation } from '@/components/dashboard/presentation/Modern2025DashboardPresentation';

const EnhancedDashboard = () => {
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

export default EnhancedDashboard;
