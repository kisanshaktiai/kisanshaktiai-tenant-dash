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
      
      // Fetch farmer with user_profiles join for complete data (if exists)
      const { data: farmerData, error: farmerError } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', farmerId)
        .eq('tenant_id', effectiveTenantId)
        .single();

      if (farmerError) throw farmerError;
      if (!farmerData) throw new Error('Farmer not found');
      
      // Try to fetch user_profiles data if it exists (optional join)
      let userProfileData: any = null;
      try {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('farmer_id', farmerId)
          .eq('tenant_id', effectiveTenantId)
          .single();
        userProfileData = profileData;
      } catch (err) {
        console.log('No user profile found for farmer:', farmerId);
      }
      
      // Merge user_profile data into farmer object if available
      const mergedFarmerData = {
        ...farmerData,
        email: userProfileData?.email || null,
        full_name: userProfileData?.full_name || farmerData.farmer_name,
        address: {
          line1: userProfileData?.address_line1,
          line2: userProfileData?.address_line2,
          city: userProfileData?.city,
          district: userProfileData?.district,
          state: userProfileData?.state,
          pincode: userProfileData?.pincode,
          country: userProfileData?.country || 'India'
        }
      };

      // Fetch lands with tenant isolation
      const { data: landsData, error: landsError } = await supabase
        .from('lands')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('tenant_id', effectiveTenantId);

      // Calculate metrics from real data
      const lands = landsData || [];
      // IMPORTANT: Prioritize database value for total_land_acres, use it if it exists and is greater than 0
      const calculatedLandAcres = lands.reduce((sum: number, land: any) => sum + (land.area_acres || 0), 0);
      const totalLandAcres = (farmerData.total_land_acres && farmerData.total_land_acres > 0) 
        ? farmerData.total_land_acres 
        : calculatedLandAcres;
      
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
      // Fetch additional data with simpler queries to avoid TypeScript issues
      let tagsData: any[] = [];
      let notesData: any[] = [];
      let segmentsData: any[] = [];
      let communicationsData: any[] = [];
      let cropHistoryData: any[] = [];
      
      // Use try-catch for each query to handle errors gracefully
      try {
        const tagsResult = await supabase
          .from('farmer_tags')
          .select('*')
          .eq('farmer_id', farmerId)
          .eq('tenant_id', effectiveTenantId);
        tagsData = tagsResult.data || [];
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
      
      try {
        const notesResult = await supabase
          .from('farmer_notes')
          .select('*')
          .eq('farmer_id', farmerId)
          .eq('tenant_id', effectiveTenantId);
        notesData = notesResult.data || [];
      } catch (err) {
        console.error('Error fetching notes:', err);
      }
      
      try {
        // Use basic select for segments
        const segmentsResult = await supabase
          .from('farmer_segments')
          .select('*')
          .match({ farmer_id: farmerId, tenant_id: effectiveTenantId });
        segmentsData = segmentsResult.data || [];
      } catch (err) {
        console.error('Error fetching segments:', err);
      }
      
      try {
        // Use basic select for communications
        const communicationsResult = await supabase
          .from('farmer_communications')
          .select('*')
          .match({ farmer_id: farmerId, tenant_id: effectiveTenantId });
        communicationsData = communicationsResult.data || [];
      } catch (err) {
        console.error('Error fetching communications:', err);
      }
      
      try {
        // Use match instead of chained eq to avoid depth issues
        const cropHistoryResult = await supabase
          .from('crop_history')
          .select('*')
          .match({ farmer_id: farmerId, tenant_id: effectiveTenantId });
        cropHistoryData = cropHistoryResult.data || [];
      } catch (err) {
        console.error('Error fetching crop history:', err);
      }

      // Build comprehensive farmer data object matching the interface
      const comprehensiveData: ComprehensiveFarmerData = {
        ...mergedFarmerData,
        total_land_acres: totalLandAcres,
        tags: tagsData || [],
        notes: notesData || [],
        segments: segmentsData?.map((s: any) => s.segment_name) || [],
        lands: lands.map((land: any) => ({
          id: land.id,
          area_acres: land.area_acres || 0,
          soil_type: land.soil_type,
          location: land.location,
          irrigation_type: land.irrigation_type,
          crops: land.crops || []
        })),
        
        cropHistory: cropHistoryData?.map((crop: any) => ({
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
        communicationHistory: communicationsData?.map((comm: any) => ({
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
          lastActivityDate: mergedFarmerData.last_login_at || mergedFarmerData.created_at,
          revenueScore,
          riskLevel,
        },
        liveStatus: {
          isOnline: lastLoginDays < 1,
          lastSeen: mergedFarmerData.last_login_at || mergedFarmerData.created_at,
          currentActivity: null,
        }
      };

      return comprehensiveData;
    },
    enabled: !!effectiveTenantId && !!farmerId,
    staleTime: 10000, // Consider data fresh for 10 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
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
    }, 500); // Debounce for 500ms to reduce flicker
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
    
    // Subscribe to user_profiles changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `tenant_id=eq.${effectiveTenantId}`,
      },
      (payload: any) => {
        if (payload.new?.farmer_id === farmerId || payload.old?.farmer_id === farmerId) {
          console.log('[RealtimeComprehensiveFarmer] User profiles update:', payload);
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
          activeChannels: 8, // We're subscribing to 8 tables
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