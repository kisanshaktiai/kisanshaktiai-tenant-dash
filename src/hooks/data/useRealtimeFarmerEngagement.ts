import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

interface FarmerEngagement {
  activityScore: number;
  appOpens: number;
  totalCommunications: number;
  lastActiveDate: string | null;
  churnRisk: 'low' | 'medium' | 'high';
}

export const useRealtimeFarmerEngagement = (farmerId?: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  const engagementQuery = useQuery<FarmerEngagement>({
    queryKey: ['farmer-engagement', currentTenant?.id, farmerId],
    queryFn: async () => {
      if (!currentTenant || !farmerId) throw new Error('No tenant or farmer selected');
      
      // Fetch farmer data (using only columns that exist in the farmers table)
      const { data: farmer, error: farmerError } = await supabase
        .from('farmers')
        .select('total_app_opens, last_login_at')
        .eq('id', farmerId)
        .eq('tenant_id', currentTenant.id)
        .single();
        
      if (farmerError) throw farmerError;
      
      // Fetch communication count
      const { count: commCount } = await supabase
        .from('farmer_communications')
        .select('*', { count: 'exact', head: true })
        .eq('farmer_id', farmerId)
        .eq('tenant_id', currentTenant.id);
      
      // Calculate engagement metrics
      const daysSinceLastLogin = farmer?.last_login_at 
        ? Math.floor((Date.now() - new Date(farmer.last_login_at).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
        
      let activityScore = 0;
      if (daysSinceLastLogin <= 7) activityScore += 30;
      else if (daysSinceLastLogin <= 30) activityScore += 15;
      
      activityScore += Math.min(40, farmer?.total_app_opens || 0);
      activityScore += Math.min(30, (commCount || 0) * 3);
      
      // Determine churn risk based on calculated metrics
      let churnRisk: 'low' | 'medium' | 'high' = 'low';
      if (activityScore < 30 || daysSinceLastLogin > 60) {
        churnRisk = 'high';
      } else if (activityScore < 60 || daysSinceLastLogin > 30) {
        churnRisk = 'medium';
      }
      
      return {
        activityScore: Math.round(activityScore),
        appOpens: farmer?.total_app_opens || 0,
        totalCommunications: commCount || 0,
        lastActiveDate: farmer?.last_login_at || null,
        churnRisk
      };
    },
    enabled: !!currentTenant && !!farmerId,
    staleTime: 0,
  });

  useEffect(() => {
    if (!currentTenant?.id || !farmerId) return;

    // Subscribe to changes in farmers table that affect engagement
    const channel = supabase.channel(`farmer_engagement_${farmerId}_${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmers',
          filter: `id=eq.${farmerId}`,
        },
        (payload) => {
          console.log('[RealtimeFarmerEngagement] Farmer update:', payload);
          queryClient.invalidateQueries({
            queryKey: ['farmer-engagement', currentTenant.id, farmerId],
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmer_communications',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload: any) => {
          if (payload.new?.farmer_id === farmerId || payload.old?.farmer_id === farmerId) {
            console.log('[RealtimeFarmerEngagement] Communication update:', payload);
            queryClient.invalidateQueries({
              queryKey: ['farmer-engagement', currentTenant.id, farmerId],
            });
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

  return engagementQuery;
};