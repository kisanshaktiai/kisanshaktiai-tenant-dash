
import { useFarmersQuery } from './useFarmersQuery';
import { useTenantRealtime } from './useTenantRealtime';
import type { FarmersListOptions } from '@/services/FarmersService';

export const useRealTimeFarmersQuery = (options: FarmersListOptions = {}) => {
  const farmersQuery = useFarmersQuery(options);
  const { isConnected, activeChannels, lastUpdate } = useTenantRealtime();

  return {
    ...farmersQuery,
    isLive: isConnected,
    activeChannels,
    lastUpdate
  };
};
