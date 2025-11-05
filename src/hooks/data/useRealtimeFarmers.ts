import { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { queryKeys } from '@/lib/queryClient';
import { farmersService, type FarmersListOptions } from '@/services/FarmersService';

interface RealtimeStatus {
  isConnected: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  channelCount: number;
}

// Define all farmer-related tables that need real-time syncing
const FARMER_RELATED_TABLES = [
  'farmers',
  'farmer_profiles',
  'farmer_land_holdings',
  'farmer_crops',
  'farmer_schedules',
  'farmer_weather_data',
  'farmer_finance_data',
  'farmer_iot_data',
  'farmer_activities',
  'farmer_documents',
  'farmer_notifications',
  'farmer_transactions'
];

export const useRealtimeFarmers = (options: FarmersListOptions = {}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelsRef = useRef<any[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastSyncTime: null,
    syncError: null,
    channelCount: 0
  });

  // Base query for farmers data
  const farmersQuery = useQuery({
    queryKey: queryKeys.farmersList(currentTenant?.id || '', options),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmersService.getFarmers(currentTenant.id, options);
    },
    enabled: !!currentTenant,
    staleTime: 0, // Always check for fresh data with real-time
    refetchInterval: realtimeStatus.isConnected ? false : 30000, // Fallback polling if disconnected
  });

  // Setup real-time subscriptions for all farmer-related tables
  useEffect(() => {
    if (!currentTenant?.id) {
      setRealtimeStatus(prev => ({
        ...prev,
        isConnected: false,
        syncError: 'No tenant selected',
        channelCount: 0
      }));
      return;
    }

    console.log('[RealtimeFarmers] Setting up real-time connections for tenant:', currentTenant.id);
    const channels: any[] = [];
    let connectedChannels = 0;

    // Create a channel for each farmer-related table
    FARMER_RELATED_TABLES.forEach((tableName) => {
      const channel = supabase
        .channel(`tenant_${tableName}_${currentTenant.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
            filter: `tenant_id=eq.${currentTenant.id}`,
          },
          (payload) => {
            console.log(`[RealtimeFarmers] ${tableName} update:`, payload);
            
            // Update last sync time
            setRealtimeStatus(prev => ({
              ...prev,
              lastSyncTime: new Date(),
              syncError: null
            }));

            // Invalidate relevant queries based on the table updated
            const queriesToInvalidate = [
              queryKeys.farmers(currentTenant.id),
              queryKeys.farmersList(currentTenant.id, options),
              queryKeys.farmerStats(currentTenant.id),
            ];

            // If a specific farmer was updated, also invalidate that farmer's query
            if (payload.new && 'id' in payload.new && tableName === 'farmers') {
              queryClient.invalidateQueries({
                queryKey: queryKeys.farmer(payload.new.id as string, currentTenant.id)
              });
            } else if (payload.old && 'id' in payload.old && tableName === 'farmers') {
              queryClient.invalidateQueries({
                queryKey: queryKeys.farmer(payload.old.id as string, currentTenant.id)
              });
            }

            // Batch invalidate queries
            queriesToInvalidate.forEach(queryKey => {
              queryClient.invalidateQueries({ queryKey });
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            connectedChannels++;
            setRealtimeStatus(prev => ({
              ...prev,
              isConnected: connectedChannels > 0,
              channelCount: connectedChannels,
              syncError: null
            }));
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            connectedChannels = Math.max(0, connectedChannels - 1);
            setRealtimeStatus(prev => ({
              ...prev,
              isConnected: connectedChannels > 0,
              channelCount: connectedChannels,
              syncError: status === 'CHANNEL_ERROR' ? 'Connection error' : null
            }));
          }
        });

      channels.push(channel);
    });

    channelsRef.current = channels;

    // Cleanup function
    return () => {
      console.log('[RealtimeFarmers] Cleaning up real-time connections');
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      setRealtimeStatus({
        isConnected: false,
        lastSyncTime: null,
        syncError: null,
        channelCount: 0
      });
    };
  }, [currentTenant, queryClient, options]);

  // Manual refresh function as fallback
  const manualRefresh = async () => {
    console.log('[RealtimeFarmers] Manual refresh triggered');
    await farmersQuery.refetch();
    setRealtimeStatus(prev => ({
      ...prev,
      lastSyncTime: new Date()
    }));
  };

  return {
    // Query data
    farmers: farmersQuery.data?.data || [],
    count: farmersQuery.data?.count || 0,
    isLoading: farmersQuery.isLoading,
    error: farmersQuery.error,
    
    // Real-time status
    realtimeStatus,
    
    // Actions
    refetch: manualRefresh,
  };
};

// Hook for individual farmer real-time data
export const useRealtimeFarmer = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!currentTenant?.id || !farmerId) {
      setIsLive(false);
      return;
    }

    // Subscribe to changes for this specific farmer
    const channel = supabase
      .channel(`farmer_${farmerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmers',
          filter: `id=eq.${farmerId}`,
        },
        (payload) => {
          console.log(`[RealtimeFarmer] update for farmer ${farmerId}:`, payload);
          setLastUpdate(new Date());
          
          // Invalidate this farmer's data
          queryClient.invalidateQueries({
            queryKey: queryKeys.farmer(farmerId, currentTenant.id)
          });
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsLive(false);
    };
  }, [currentTenant, farmerId, queryClient]);

  return {
    isLive,
    lastUpdate
  };
};