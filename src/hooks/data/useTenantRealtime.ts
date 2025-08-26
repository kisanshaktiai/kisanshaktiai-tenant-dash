
import { useMemo } from 'react';
import { useConsolidatedRealtime } from '@/hooks/realtime/useConsolidatedRealtime';

// Legacy hook for backward compatibility - now uses consolidated service
export const useTenantRealtime = () => {
  const connectionStatus = useConsolidatedRealtime();
  
  return useMemo(() => ({
    ...connectionStatus,
    lastUpdate: new Date()
  }), [connectionStatus]);
};

export interface TenantRealtimeStatus {
  isConnected: boolean;
  activeChannels: number;
  lastUpdate?: Date;
}
