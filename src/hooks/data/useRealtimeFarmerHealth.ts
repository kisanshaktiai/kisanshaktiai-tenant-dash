import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { 
  useFarmerSoilHealth, 
  useFarmerNDVIHistory, 
  useFarmerHealthAssessments 
} from './useFarmerHealthData';

export const useRealtimeFarmerHealth = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  
  // Use existing health data hooks
  const soilHealthQuery = useFarmerSoilHealth(farmerId);
  const ndviHistoryQuery = useFarmerNDVIHistory(farmerId);
  const healthAssessmentsQuery = useFarmerHealthAssessments(farmerId);

  useEffect(() => {
    if (!currentTenant?.id || !farmerId) return;

    // Subscribe to lands and health assessment changes
    const channel = supabase.channel(`farmer_health_${farmerId}_${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lands',
          filter: `farmer_id=eq.${farmerId}`,
        },
        (payload) => {
          console.log('[RealtimeFarmerHealth] Lands update:', payload);
          // Invalidate all health-related queries
          queryClient.invalidateQueries({ queryKey: ['farmer-soil-health', farmerId] });
          queryClient.invalidateQueries({ queryKey: ['farmer-ndvi-history', farmerId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crop_health_assessments',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        async (payload: any) => {
          // Check if this assessment is for our farmer's land
          if (payload.new?.land_id || payload.old?.land_id) {
            const landId = payload.new?.land_id || payload.old?.land_id;
            
            // Check if land belongs to this farmer
            const { data: land } = await supabase
              .from('lands')
              .select('farmer_id')
              .eq('id', landId)
              .single();
              
            if (land?.farmer_id === farmerId) {
              console.log('[RealtimeFarmerHealth] Health assessment update:', payload);
              queryClient.invalidateQueries({ queryKey: ['farmer-health-assessments', farmerId] });
              queryClient.invalidateQueries({ queryKey: ['farmer-ndvi-history', farmerId] });
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentTenant, farmerId, queryClient]);

  return {
    soilHealth: soilHealthQuery.data,
    ndviHistory: ndviHistoryQuery.data,
    healthAssessments: healthAssessmentsQuery.data,
    isLoading: soilHealthQuery.isLoading || ndviHistoryQuery.isLoading || healthAssessmentsQuery.isLoading,
    error: soilHealthQuery.error || ndviHistoryQuery.error || healthAssessmentsQuery.error
  };
};