
import { useEngagementQuery } from './useAnalyticsQuery';
import { useTenantRealtime } from './useTenantRealtime';

export const useRealTimeEngagement = () => {
  const engagementQuery = useEngagementQuery();
  const { isConnected, activeChannels, lastUpdate } = useTenantRealtime();

  return {
    ...engagementQuery,
    isLive: isConnected,
    activeChannels,
    lastUpdate
  };
};
