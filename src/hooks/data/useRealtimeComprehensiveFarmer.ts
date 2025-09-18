import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import type { ComprehensiveFarmerData } from '@/services/EnhancedFarmerDataService';

interface RealtimeStatus {
  isConnected: boolean;
  lastSyncTime: Date | null;
  activeChannels: number;
  error: string | null;
}

export const useRealtimeComprehensiveFarmer = (farmerId: string, tenantId?: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const debounceTimer = useRef<any>(null);
  
  // Use provided tenantId or fallback to currentTenant
  const effectiveTenantId = tenantId || currentTenant?.id;

  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastSyncTime: null,
    activeChannels: 0,
    error: null
  });

  // Main query for comprehensive farmer data with proper tenant isolation
  const farmerQuery = useQuery<ComprehensiveFarmerData>({
    queryKey: ['comprehensive-farmer', effectiveTenantId, farmerId],
    queryFn: async () => {
      if (!effectiveTenantId) throw new Error('No tenant ID provided');
      if (!farmerId) throw new Error('No farmer ID provided');
      
      // Fetch farmer base data with tenant isolation
      const { data: farmerData, error: farmerError } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', farmerId)
        .eq('tenant_id', effectiveTenantId)
        .single();

      if (farmerError) throw farmerError;
      if (!farmerData) throw new Error('Farmer not found');

      // Fetch lands with tenant isolation
      const { data: landsData, error: landsError } = await supabase
        .from('lands')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('tenant_id', effectiveTenantId);

      // Calculate metrics from real data
      const lands = landsData || [];
      const totalLandAcres = lands.reduce((sum: number, land: any) => 
        sum + (land.area_acres || 0), 0);
      
      const uniqueCrops = new Set<string>();
      lands.forEach((land: any) => {
        if (land.crop_type) uniqueCrops.add(land.crop_type);
      });
      if (farmerData.primary_crops) {
        farmerData.primary_crops.forEach((crop: string) => uniqueCrops.add(crop));
      }
      
      const cropDiversityIndex = uniqueCrops.size;
      
      // Calculate engagement score based on real data
      const appOpens = farmerData.total_app_opens || 0;
      const lastLoginDays = farmerData.last_login_at 
        ? Math.floor((Date.now() - new Date(farmerData.last_login_at).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      let engagementScore = 0;
      if (appOpens > 50) engagementScore += 40;
      else if (appOpens > 20) engagementScore += 25;
      else if (appOpens > 5) engagementScore += 15;
      
      if (lastLoginDays < 7) engagementScore += 30;
      else if (lastLoginDays < 30) engagementScore += 20;
      else if (lastLoginDays < 90) engagementScore += 10;
      
      if (farmerData.is_verified) engagementScore += 20;
      if (cropDiversityIndex > 3) engagementScore += 10;
      
      engagementScore = Math.min(100, engagementScore);
      
      // Calculate risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (engagementScore < 30 || lastLoginDays > 60) riskLevel = 'high';
      else if (engagementScore < 60 || lastLoginDays > 30) riskLevel = 'medium';
      
      // Calculate health score (simplified version)
      let healthScore = 50;
      if (farmerData.has_irrigation) healthScore += 20;
      if (farmerData.has_storage) healthScore += 15;
      if (farmerData.has_tractor) healthScore += 15;
      
      // Calculate revenue score (simplified)
      const revenueScore = Math.min(100, totalLandAcres * 10 + cropDiversityIndex * 15);

      // Fetch additional data with tenant isolation - simplified queries
      const tagsResult = await supabase
        .from('farmer_tags')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('tenant_id', effectiveTenantId);
      
      const notesResult = await supabase
        .from('farmer_notes')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('tenant_id', effectiveTenantId);
      
      const segmentsResult = await supabase
        .from('farmer_segments')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('tenant_id', effectiveTenantId);
      
      const communicationsResult = await supabase
        .from('farmer_communications')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('tenant_id', effectiveTenantId);
      
      const cropHistoryResult = await supabase
        .from('crop_history')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('tenant_id', effectiveTenantId);

      // Build comprehensive farmer data object matching the interface
      const comprehensiveData: ComprehensiveFarmerData = {
        ...farmerData,
        total_land_acres: totalLandAcres,
        tags: tagsResult.data || [],
        notes: notesResult.data || [],
        segments: segmentsResult.data?.map(s => s.segment_name) || [],
        lands: lands.map((land: any) => ({
          id: land.id,
          area_acres: land.area_acres || 0,
          soil_type: land.soil_type,
          location: land.location,
          irrigation_type: land.irrigation_type,
          crops: land.crops || []
        })),
        cropHistory: cropHistoryResult.data?.map((crop: any) => ({
          id: crop.id,
          crop_name: crop.crop_name,
          variety: crop.variety,
          season: crop.season,
          yield_kg_per_acre: crop.yield_kg_per_acre,
          planting_date: crop.planting_date,
          harvest_date: crop.harvest_date,
          status: crop.status || 'active'
        })) || [],
        healthAssessments: [],
        communicationHistory: communicationsResult.data?.map((comm: any) => ({
          id: comm.id,
          communication_type: comm.communication_type,
          channel: comm.channel,
          status: comm.status,
          sent_at: comm.sent_at,
          delivered_at: comm.delivered_at,
          read_at: comm.read_at
        })) || [],
        metrics: {
          totalLandArea: totalLandAcres,
          cropDiversityIndex,
          engagementScore,
          healthScore,
          lastActivityDate: farmerData.last_login_at || farmerData.created_at,
          revenueScore,
          riskLevel,
        },
        liveStatus: {
          isOnline: lastLoginDays < 1,
          lastSeen: farmerData.last_login_at || farmerData.created_at,
          currentActivity: null,
        }
      };

      return comprehensiveData;
    },
    enabled: !!effectiveTenantId && !!farmerId,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: realtimeStatus.isConnected ? false : 30000, // Fallback polling if not connected
  });

  // Debounced invalidation to batch multiple realtime events
  const invalidateFarmerData = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (effectiveTenantId && farmerId) {
        // Invalidate all related queries
        queryClient.invalidateQueries({
          queryKey: ['comprehensive-farmer', effectiveTenantId, farmerId],
        });
      }
      setRealtimeStatus(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        error: null
      }));
    }, 300); // Debounce for 300ms
  }, [effectiveTenantId, farmerId, queryClient]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!effectiveTenantId || !farmerId) {
      setRealtimeStatus({
        isConnected: false,
        lastSyncTime: null,
        activeChannels: 0,
        error: 'Missing tenant or farmer ID'
      });
      return;
    }

    console.log('[RealtimeComprehensiveFarmer] Setting up realtime for:', { farmerId, tenantId: effectiveTenantId });

    // Create a single channel for all subscriptions
    const channel = supabase.channel(`farmer_rt_${farmerId}_${effectiveTenantId}`);
    
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
        console.log('[RealtimeComprehensiveFarmer] Farmers table update:', payload);
        invalidateFarmerData();
      }
    );

    // Subscribe to lands table changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'lands',
        filter: `farmer_id=eq.${farmerId}`,
      },
      (payload) => {
        console.log('[RealtimeComprehensiveFarmer] Lands update:', payload);
        invalidateFarmerData();
      }
    );

    // Subscribe to farmer_tags changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'farmer_tags',
        filter: `tenant_id=eq.${effectiveTenantId}`,
      },
      (payload: any) => {
        if (payload.new?.farmer_id === farmerId || payload.old?.farmer_id === farmerId) {
          console.log('[RealtimeComprehensiveFarmer] Tags update:', payload);
          invalidateFarmerData();
        }
      }
    );

    // Subscribe to farmer_notes changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'farmer_notes',
        filter: `tenant_id=eq.${effectiveTenantId}`,
      },
      (payload: any) => {
        if (payload.new?.farmer_id === farmerId || payload.old?.farmer_id === farmerId) {
          console.log('[RealtimeComprehensiveFarmer] Notes update:', payload);
          invalidateFarmerData();
        }
      }
    );

    // Subscribe to farmer_segments changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'farmer_segments',
        filter: `tenant_id=eq.${effectiveTenantId}`,
      },
      (payload: any) => {
        if (payload.new?.farmer_id === farmerId || payload.old?.farmer_id === farmerId) {
          console.log('[RealtimeComprehensiveFarmer] Segments update:', payload);
          invalidateFarmerData();
        }
      }
    );

    // Subscribe to farmer_communications changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'farmer_communications',
        filter: `tenant_id=eq.${effectiveTenantId}`,
      },
      (payload: any) => {
        if (payload.new?.farmer_id === farmerId || payload.old?.farmer_id === farmerId) {
          console.log('[RealtimeComprehensiveFarmer] Communications update:', payload);
          invalidateFarmerData();
        }
      }
    );

    // Subscribe to crop_history changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'crop_history',
        filter: `tenant_id=eq.${effectiveTenantId}`,
      },
      (payload: any) => {
        if (payload.new?.farmer_id === farmerId || payload.old?.farmer_id === farmerId) {
          console.log('[RealtimeComprehensiveFarmer] Crop history update:', payload);
          invalidateFarmerData();
        }
      }
    );

    // Subscribe to channel
    channel.subscribe((status) => {
      console.log('[RealtimeComprehensiveFarmer] Channel status:', status);
      
      if (status === 'SUBSCRIBED') {
        setRealtimeStatus({
          isConnected: true,
          lastSyncTime: new Date(),
          activeChannels: 7, // We're subscribing to 7 tables
          error: null
        });
      } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
        setRealtimeStatus(prev => ({
          ...prev,
          isConnected: false,
          activeChannels: 0,
          error: status === 'CHANNEL_ERROR' ? 'Connection error' : 'Connection closed'
        }));
      }
    });

    channelRef.current = channel;

    // Cleanup
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
  }, [effectiveTenantId, farmerId, invalidateFarmerData]);

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
    isRefetching: farmerQuery.isRefetching,
  };
};