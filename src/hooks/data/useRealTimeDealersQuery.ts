
import { useDealersQuery } from './useDealersQuery';
import { useTenantRealtime } from './useTenantRealtime';
import type { DealersListOptions } from '@/services/DealersService';

export const useRealTimeDealersQuery = (options: DealersListOptions = {}) => {
  const dealersQuery = useDealersQuery(options);
  const { isConnected, activeChannels, lastUpdate } = useTenantRealtime();

  return {
    ...dealersQuery,
    isLive: isConnected,
    activeChannels,
    lastUpdate
  };
};
