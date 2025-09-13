import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';

// Define farmer-related tables and their relationships
const FARMER_TABLES = [
  'farmers',
  'farmer_engagement',
  'farmer_leads',
  'farmer_notes',
  'farmer_segments',
  'farmer_tags',
  'farmer_activities',
  'land_parcels',
  'crop_cycles',
  'schedules',
  'weather_data',
  'finance_data',
  'iot_sensor_data'
] as const;

type FarmerTable = typeof FARMER_TABLES[number];

interface RealtimeStatus {
  isConnected: boolean;
  activeChannels: number;
  lastSyncTime: Date | null;
  lastError: string | null;
  syncedTables: Set<FarmerTable>;
  pendingUpdates: number;
}

interface TableUpdateEvent {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: Date;
}

export const useComprehensiveRealtime = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelsRef = useRef<any[]>([]);
  const updateQueueRef = useRef<TableUpdateEvent[]>([]);
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    activeChannels: 0,
    lastSyncTime: null,
    lastError: null,
    syncedTables: new Set(),
    pendingUpdates: 0
  });

  // Process updates in batches to avoid overwhelming the UI
  const processBatchedUpdates = useCallback(() => {
    if (updateQueueRef.current.length === 0) return;

    const updates = [...updateQueueRef.current];
    updateQueueRef.current = [];

    // Group updates by table
    const updatesByTable = updates.reduce((acc, update) => {
      if (!acc[update.table]) acc[update.table] = [];
      acc[update.table].push(update);
      return acc;
    }, {} as Record<string, TableUpdateEvent[]>);

    // Invalidate queries for each affected table
    Object.entries(updatesByTable).forEach(([table, tableUpdates]) => {
      console.log(`Processing ${tableUpdates.length} updates for ${table}`);
      
      // Invalidate specific farmer queries if farmer_id is present
      const farmerIds = new Set(
        tableUpdates
          .map(u => u.payload?.farmer_id || u.payload?.record?.farmer_id)
          .filter(Boolean)
      );

      if (farmerIds.size > 0) {
        farmerIds.forEach(farmerId => {
          queryClient.invalidateQueries({
            queryKey: ['farmer', currentTenant?.id, farmerId]
          });
        });
      }

      // Invalidate table-specific queries
      queryClient.invalidateQueries({
        queryKey: [table, currentTenant?.id]
      });
    });

    // Always invalidate aggregate queries
    queryClient.invalidateQueries({
      queryKey: queryKeys.farmers(currentTenant?.id || '')
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.farmerStats(currentTenant?.id || '')
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.dashboardStats(currentTenant?.id || '')
    });

    setStatus(prev => ({
      ...prev,
      lastSyncTime: new Date(),
      pendingUpdates: 0
    }));
  }, [currentTenant, queryClient]);

  // Debounced update processor
  useEffect(() => {
    const interval = setInterval(() => {
      if (updateQueueRef.current.length > 0) {
        processBatchedUpdates();
      }
    }, 500); // Process updates every 500ms

    return () => clearInterval(interval);
  }, [processBatchedUpdates]);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, pendingUpdates: prev.pendingUpdates + 1 }));
      
      // Force refresh all farmer-related queries
      await Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.farmers(currentTenant?.id || '') }),
        queryClient.refetchQueries({ queryKey: queryKeys.farmerStats(currentTenant?.id || '') }),
        queryClient.refetchQueries({ queryKey: queryKeys.dashboardStats(currentTenant?.id || '') })
      ]);

      setStatus(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        pendingUpdates: Math.max(0, prev.pendingUpdates - 1)
      }));

      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Manual refresh error:', error);
      toast.error('Failed to refresh data');
      setStatus(prev => ({
        ...prev,
        lastError: 'Manual refresh failed',
        pendingUpdates: Math.max(0, prev.pendingUpdates - 1)
      }));
    }
  }, [currentTenant, queryClient]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!currentTenant?.id) {
      console.log('No tenant available, skipping realtime setup');
      setStatus(prev => ({ ...prev, isConnected: false, activeChannels: 0 }));
      return;
    }

    console.log('Setting up comprehensive real-time connections for tenant:', currentTenant.id);
    
    const setupChannels = async () => {
      const channels: any[] = [];
      const syncedTables = new Set<FarmerTable>();

      // Check which tables exist and set up channels for them
      for (const tableName of FARMER_TABLES) {
        try {
          // Create a channel for each table
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
                console.log(`Real-time update for ${tableName}:`, payload);
                
                // Queue the update
                updateQueueRef.current.push({
                  table: tableName,
                  event: payload.eventType as any,
                  payload,
                  timestamp: new Date()
                });

                setStatus(prev => ({
                  ...prev,
                  pendingUpdates: prev.pendingUpdates + 1
                }));
              }
            );

          // Subscribe to the channel
          channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              channels.push(channel);
              syncedTables.add(tableName as FarmerTable);
              console.log(`Successfully subscribed to ${tableName}`);
            } else if (status === 'CHANNEL_ERROR') {
              console.warn(`Could not subscribe to ${tableName}:`, status);
            }
          });
        } catch (error) {
          console.warn(`Table ${tableName} might not exist yet, skipping:`, error);
        }
      }

      channelsRef.current = channels;
      setStatus(prev => ({
        ...prev,
        isConnected: channels.length > 0,
        activeChannels: channels.length,
        syncedTables,
        lastError: null
      }));

      return channels;
    };

    const handleConnectionError = (error: any) => {
      console.error('Real-time connection error:', error);
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        lastError: error.message || 'Connection failed'
      }));
      toast.error('Real-time sync disconnected. Click refresh to sync manually.');
    };

    // Setup channels with error handling
    setupChannels().catch(handleConnectionError);

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time connections');
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        activeChannels: 0,
        syncedTables: new Set()
      }));
    };
  }, [currentTenant]);

  return {
    ...status,
    manualRefresh,
    isLoading: status.pendingUpdates > 0
  };
};