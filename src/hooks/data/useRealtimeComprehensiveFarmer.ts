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

// Core farmer tables that exist in our schema
const FARMER_TABLES = [
  'farmers',
  'user_profile',  // Changed from farmer_profiles
  'lands',
  'crop_history',
  'crop_health_assessments',
  'farmer_tags',
  'farmer_notes',
  'farmer_segments',
  'farmer_communications'
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
    gcTime: 0, // Don't cache at all
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
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

    // Unified channel for all farmer-related tables with proper tenant isolation
    const channel = supabase.channel(`comprehensive_farmer_${farmerId}_${currentTenant.id}`);

    // Subscribe to farmers table changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'farmers',
        filter: `id=eq.${farmerId}`,
      },
      (payload) => {
        console.log('[RealtimeComprehensiveFarmer] farmers update:', payload);
        invalidateFarmerData();
      }
    );

    // Subscribe to user_profile changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profile',
        filter: `farmer_id=eq.${farmerId}`,
      },
      (payload) => {
        console.log('[RealtimeComprehensiveFarmer] user_profile update:', payload);
        invalidateFarmerData();
      }
    );

    // Subscribe to lands table changes with tenant isolation
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'lands',
        filter: `farmer_id=eq.${farmerId}`,
      },
      (payload) => {
        console.log('[RealtimeComprehensiveFarmer] lands update:', payload);
        invalidateFarmerData();
      }
    );

    // Subscribe to other tables with tenant-based filtering
    const tenantScopedTables = [
      'crop_history',
      'crop_health_assessments',
      'farmer_tags',
      'farmer_notes',
      'farmer_segments',
      'farmer_communications'
    ];

    tenantScopedTables.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload: any) => {
          // Check if the change is for our farmer
          if (payload.new?.farmer_id === farmerId || payload.old?.farmer_id === farmerId) {
            console.log(`[RealtimeComprehensiveFarmer] ${table} update:`, payload);
            invalidateFarmerData();
          }
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
