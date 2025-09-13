import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { enhancedFarmerDataService, type ComprehensiveFarmerData } from '@/services/EnhancedFarmerDataService';

interface RealtimeStatus {
  isConnected: boolean;
  lastSyncTime: Date | null;
  activeChannels: number;
  error: string | null;
}

// All related farmer tables we care about
const FARMER_TABLES = [
  'farmers',
  'farmer_profiles',
  'lands',
  'farmer_land_holdings',
  'farmer_crops',
  'crop_history',
  'crop_health_assessments',
  'ndvi_history',            // if present in schema
  'farmer_tags',
  'farmer_notes',
  'farmer_segments',
  'farmer_engagement',
  'farmer_gamification',
  'farmer_documents',
  'farmer_transactions',
  'farmer_finance_data',
  'farmer_schedules',
  'farmer_notifications',
  'farmer_communications',
  'farmer_iot_data',
  'farmer_weather_data',
  'weather_forecast'         // if present in schema
];

export const useRealtimeComprehensiveFarmer = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const debounceTimer = useRef<any>(null);

  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastSyncTime: null,
    activeChannels: 0,
    error: null
  });

  // Main query for comprehensive farmer data
  const farmerQuery = useQuery<ComprehensiveFarmerData>({
    queryKey: ['comprehensive-farmer', currentTenant?.id, farmerId],
    queryFn: () => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerDataService.getComprehensiveFarmerData(currentTenant.id, farmerId);
    },
    enabled: !!currentTenant && !!farmerId,
    staleTime: 0,
    refetchInterval: realtimeStatus.isConnected ? false : 30000, // fallback polling
  });

  // Debounced invalidation to batch events
  const invalidateFarmerData = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (currentTenant?.id && farmerId) {
        queryClient.invalidateQueries({
          queryKey: ['comprehensive-farmer', currentTenant.id, farmerId],
        });
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['farmer-notes', farmerId] });
        queryClient.invalidateQueries({ queryKey: ['farmer-engagement', farmerId] });
        queryClient.invalidateQueries({ queryKey: ['farmer-health-data', farmerId] });
        queryClient.invalidateQueries({ queryKey: ['farmer-weather', farmerId] });
      }
      setRealtimeStatus(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        error: null
      }));
    }, 500); // debounce 0.5s
  };

  useEffect(() => {
    if (!currentTenant?.id || !farmerId) {
      setRealtimeStatus({
        isConnected: false,
        lastSyncTime: null,
        activeChannels: 0,
        error: 'No tenant or farmer selected'
      });
      return;
    }

    console.log('[RealtimeComprehensiveFarmer] Setting up channel for farmer:', farmerId);

    // Unified channel for all farmer-related tables
    const channel = supabase.channel(`comprehensive_farmer_${farmerId}_${currentTenant.id}`);

    FARMER_TABLES.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: table === 'farmers'
            ? `id=eq.${farmerId}`
            : table === 'lands' || table === 'farmer_profiles'
            ? `farmer_id=eq.${farmerId}`
            : `tenant_id=eq.${currentTenant.id}`, // tenant scope fallback
        },
        (payload) => {
          console.log(`[RealtimeComprehensiveFarmer] ${table} update:`, payload);
          invalidateFarmerData();
        }
      );
    });

    channel.subscribe((status) => {
      console.log('[RealtimeComprehensiveFarmer] Channel status:', status);

      if (status === 'SUBSCRIBED') {
        setRealtimeStatus({
          isConnected: true,
          lastSyncTime: new Date(),
          activeChannels: FARMER_TABLES.length,
          error: null
        });
      } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
        setRealtimeStatus({
          isConnected: false,
          lastSyncTime: null,
          activeChannels: 0,
          error: status === 'CHANNEL_ERROR' ? 'Connection error' : null
        });
      }
    });

    channelRef.current = channel;

    return () => {
      console.log('[RealtimeComprehensiveFarmer] Cleaning up channel');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setRealtimeStatus({
        isConnected: false,
        lastSyncTime: null,
        activeChannels: 0,
        error: null
      });
    };
  }, [currentTenant, farmerId, queryClient]);

  // Manual refresh function
  const manualRefresh = async () => {
    console.log('[RealtimeComprehensiveFarmer] Manual refresh triggered');
    await farmerQuery.refetch();
    setRealtimeStatus(prev => ({
      ...prev,
      lastSyncTime: new Date()
    }));
  };

  return {
    farmer: farmerQuery.data,
    isLoading: farmerQuery.isLoading,
    error: farmerQuery.error,
    realtimeStatus,
    refetch: manualRefresh,
  };
};
