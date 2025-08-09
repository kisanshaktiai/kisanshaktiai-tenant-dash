
import React from 'react';
import { AnalyticsPagePresentation } from '../presentation/AnalyticsPagePresentation';
import { useRealTimeEngagement } from '@/hooks/data/useRealTimeEngagement';

export const AnalyticsPageContainer = () => {
  const { data, isLoading, error, isLive, activeChannels } = useRealTimeEngagement();

  return (
    <AnalyticsPagePresentation 
      data={data}
      isLoading={isLoading}
      error={error}
      isLive={isLive}
      activeChannels={activeChannels}
    />
  );
};
