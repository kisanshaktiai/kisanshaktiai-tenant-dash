import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { queryKeys } from '@/lib/queryClient';
import { supabase } from '@/integrations/supabase/client';

interface FarmerStats {
  totalFarmers: number;
  activeFarmers: number;
  totalLandArea: number;
  verifiedFarmers: number;
  averageExperience: number;
  withIrrigation: number;
  withTractor: number;
  withStorage: number;
}

export const useRealtimeFarmerStats = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const statsQuery = useQuery<FarmerStats>({
    queryKey: queryKeys.farmerStats(currentTenant?.id || ''),
    queryFn: async () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }

      // Fetch aggregate stats from farmers table
      const { data: farmers, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('tenant_id', currentTenant.id);

      if (error) {
        throw error;
      }

      if (!farmers || farmers.length === 0) {
        return {
          totalFarmers: 0,
          activeFarmers: 0,
          totalLandArea: 0,
          verifiedFarmers: 0,
          averageExperience: 0,
          withIrrigation: 0,
          withTractor: 0,
          withStorage: 0,
        };
      }

      // Calculate stats
      const totalFarmers = farmers.length;
      const activeFarmers = farmers.filter(f => f.total_app_opens > 0).length;
      const totalLandArea = farmers.reduce((sum, f) => sum + (f.total_land_acres || 0), 0);
      const verifiedFarmers = farmers.filter(f => f.is_verified).length;
      const totalExperience = farmers.reduce((sum, f) => sum + (f.farming_experience_years || 0), 0);
      const averageExperience = totalFarmers > 0 ? Math.round(totalExperience / totalFarmers) : 0;
      const withIrrigation = farmers.filter(f => f.has_irrigation).length;
      const withTractor = farmers.filter(f => f.has_tractor).length;
      const withStorage = farmers.filter(f => f.has_storage).length;

      return {
        totalFarmers,
        activeFarmers,
        totalLandArea,
        verifiedFarmers,
        averageExperience,
        withIrrigation,
        withTractor,
        withStorage,
      };
    },
    enabled: !!currentTenant,
    staleTime: 0, // Always fresh with real-time
    refetchInterval: false, // Disable polling, use real-time updates instead
  });

  return statsQuery;
};