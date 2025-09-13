import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { enhancedFarmerDataService, type ComprehensiveFarmerData } from '@/services/EnhancedFarmerDataService';

// Define all farmer-related tables for real-time subscription
const FARMER_RELATED_TABLES = [
  'farmers',
  'farmer_profiles', 
  'lands',
  'crop_history',
  'crop_health_assessments',
  'farmer_activities',
  'farmer_documents',
  'farmer_notifications',
  'farmer_transactions',
  'farmer_land_holdings',
  'farmer_crops',
  'farmer_schedules',
  'farmer_weather_data',
  'farmer_finance_data',
  'farmer_iot_data'
];

interface RealtimeStatus {
  isConnected: boolean;
  lastSyncTime: Date | null;
  activeChannels: number;
  error: string | null;
}

export const useRealtimeComprehensiveFarmer = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelsRef = useRef<any[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastSyncTime: null,
    activeChannels: 0,
    error: null
  });

  // Main query for comprehensive farmer data
  const farmerQuery = useQuery({
    queryKey: ['comprehensive-farmer', currentTenant?.id, farmerId],
    queryFn: () => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerDataService.getComprehensiveFarmerData(currentTenant.id, farmerId);
    },
    enabled: !!currentTenant && !!farmerId,
    staleTime: 0, // Always check for fresh data with real-time
    refetchInterval: realtimeStatus.isConnected ? false : 30000, // Fallback polling if disconnected
  });

  // Setup real-time subscriptions
  useEffect(() => {
    if (!currentTenant?.id || !farmerId) {
      setRealtimeStatus(prev => ({
        ...prev,
        isConnected: false,
        error: 'No tenant or farmer selected',
        activeChannels: 0
      }));
      return;
    }

    console.log('[RealtimeComprehensiveFarmer] Setting up subscriptions for:', farmerId);
    
    const channels: any[] = [];
    let connectedChannels = 0;

    // Create a unified channel for all farmer updates
    const channel = supabase
      .channel(`comprehensive_farmer_${farmerId}_${currentTenant.id}`)
      // Subscribe to farmer table changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmers',
          filter: `id=eq.${farmerId}`,
        },
        (payload) => {
          console.log('[RealtimeComprehensiveFarmer] Farmer update:', payload);
          handleDataUpdate('farmers', payload);
        }
      )
      // Subscribe to lands changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lands',
          filter: `farmer_id=eq.${farmerId}`,
        },
        (payload) => {
          console.log('[RealtimeComprehensiveFarmer] Lands update:', payload);
          handleDataUpdate('lands', payload);
        }
      )
      // Subscribe to crop history changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crop_history',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        async (payload) => {
          // Check if this crop history belongs to the farmer's lands
          const { data: lands } = await supabase
            .from('lands')
            .select('id')
            .eq('farmer_id', farmerId)
            .eq('tenant_id', currentTenant.id);
          
          const newData = payload.new as any;
          const oldData = payload.old as any;
          if (lands?.some(l => l.id === newData?.land_id || l.id === oldData?.land_id)) {
            console.log('[RealtimeComprehensiveFarmer] Crop history update:', payload);
            handleDataUpdate('crop_history', payload);
          }
        }
      )
      // Subscribe to health assessments
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crop_health_assessments',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        async (payload) => {
          // Check if this assessment belongs to the farmer's lands
          const { data: lands } = await supabase
            .from('lands')
            .select('id')
            .eq('farmer_id', farmerId)
            .eq('tenant_id', currentTenant.id);
          
          const newData = payload.new as any;
          const oldData = payload.old as any;
          if (lands?.some(l => l.id === newData?.land_id || l.id === oldData?.land_id)) {
            console.log('[RealtimeComprehensiveFarmer] Health assessment update:', payload);
            handleDataUpdate('crop_health_assessments', payload);
          }
        }
      )
      // Subscribe to farmer profiles if exists
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmer_profiles',
          filter: `farmer_id=eq.${farmerId}`,
        },
        (payload) => {
          console.log('[RealtimeComprehensiveFarmer] Profile update:', payload);
          handleDataUpdate('farmer_profiles', payload);
        }
      );

    // Handle data updates
    const handleDataUpdate = (tableName: string, payload: any) => {
      setRealtimeStatus(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        error: null
      }));

      // Invalidate the specific farmer query
      queryClient.invalidateQueries({
        queryKey: ['comprehensive-farmer', currentTenant.id, farmerId]
      });

      // Also invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['farmer-notes', farmerId]
      });
      queryClient.invalidateQueries({
        queryKey: ['farmer-engagement', farmerId]
      });
      queryClient.invalidateQueries({
        queryKey: ['farmer-health-data', farmerId]
      });
    };

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`[RealtimeComprehensiveFarmer] Channel status:`, status);
      
      if (status === 'SUBSCRIBED') {
        connectedChannels = 1;
        setRealtimeStatus(prev => ({
          ...prev,
          isConnected: true,
          activeChannels: connectedChannels,
          error: null
        }));
      } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
        connectedChannels = 0;
        setRealtimeStatus(prev => ({
          ...prev,
          isConnected: false,
          activeChannels: connectedChannels,
          error: status === 'CHANNEL_ERROR' ? 'Connection error' : null
        }));
      }
    });

    channels.push(channel);
    channelsRef.current = channels;

    // Cleanup function
    return () => {
      console.log('[RealtimeComprehensiveFarmer] Cleaning up subscriptions');
      channels.forEach((ch) => {
        supabase.removeChannel(ch);
      });
      channelsRef.current = [];
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

// Hook for multiple farmers with real-time updates
export const useRealtimeEnhancedFarmers = (options: any = {}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastSyncTime: null,
    activeChannels: 0,
    error: null
  });

  // Main query for farmers list
  const farmersQuery = useQuery({
    queryKey: ['enhanced-farmers', currentTenant?.id, options],
    queryFn: () => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerDataService.getFarmersWithPagination(currentTenant.id, options);
    },
    enabled: !!currentTenant,
    staleTime: 0,
    refetchInterval: realtimeStatus.isConnected ? false : 30000,
  });

  // Setup real-time subscription for all farmers
  useEffect(() => {
    if (!currentTenant?.id) {
      setRealtimeStatus(prev => ({
        ...prev,
        isConnected: false,
        error: 'No tenant selected',
        activeChannels: 0
      }));
      return;
    }

    console.log('[RealtimeEnhancedFarmers] Setting up subscriptions for tenant:', currentTenant.id);

    const channel = supabase
      .channel(`tenant_farmers_all_${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmers',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          console.log('[RealtimeEnhancedFarmers] Farmers update:', payload);
          
          setRealtimeStatus(prev => ({
            ...prev,
            lastSyncTime: new Date(),
            error: null
          }));

          // Invalidate farmers list query
          queryClient.invalidateQueries({
            queryKey: ['enhanced-farmers', currentTenant.id]
          });

          // Also invalidate specific farmer if it was updated
          const newData = payload.new as any;
          const oldData = payload.old as any;
          if (newData?.id || oldData?.id) {
            const farmerId = newData?.id || oldData?.id;
            queryClient.invalidateQueries({
              queryKey: ['comprehensive-farmer', currentTenant.id, farmerId]
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('[RealtimeEnhancedFarmers] Channel status:', status);
        
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus(prev => ({
            ...prev,
            isConnected: true,
            activeChannels: 1,
            error: null
          }));
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          setRealtimeStatus(prev => ({
            ...prev,
            isConnected: false,
            activeChannels: 0,
            error: status === 'CHANNEL_ERROR' ? 'Connection error' : null
          }));
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('[RealtimeEnhancedFarmers] Cleaning up subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setRealtimeStatus({
        isConnected: false,
        lastSyncTime: null,
        activeChannels: 0,
        error: null
      });
    };
  }, [currentTenant, queryClient]);

  const manualRefresh = async () => {
    console.log('[RealtimeEnhancedFarmers] Manual refresh triggered');
    await farmersQuery.refetch();
    setRealtimeStatus(prev => ({
      ...prev,
      lastSyncTime: new Date()
    }));
  };

  return {
    farmers: farmersQuery.data?.data || [],
    count: farmersQuery.data?.count || 0,
    totalPages: farmersQuery.data?.totalPages || 0,
    isLoading: farmersQuery.isLoading,
    error: farmersQuery.error,
    realtimeStatus,
    refetch: manualRefresh,
  };
};