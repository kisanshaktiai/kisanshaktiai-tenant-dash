import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

export interface FarmerLand {
  id: string;
  tenant_id: string;
  farmer_id: string;
  name: string;
  survey_number: string | null;
  area_acres: number;
  area_guntas: number | null;
  village: string | null;
  taluka: string | null;
  district: string | null;
  state: string | null;
  soil_type: string | null;
  land_type: string | null;
  water_source: string | null;
  irrigation_source: string | null;
  ownership_type: string | null;
  current_crop: string | null;
  crop_stage: string | null;
  last_sowing_date: string | null;
  expected_harvest_date: string | null;
  // NDVI fields
  last_ndvi_value: number | null;
  last_ndvi_calculation: string | null;
  ndvi_thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmerLandsStats {
  totalLands: number;
  totalAreaAcres: number;
  irrigatedArea: number;
  uniqueCrops: string[];
  averageNDVI: number | null;
  landsWithNDVI: number;
}

export const useFarmerLandsRealtime = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const [isLive, setIsLive] = useState(false);

  const queryKey = ['farmer-lands-realtime', currentTenant?.id, farmerId];

  const { data: lands, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!currentTenant?.id || !farmerId) return [];

      const { data, error } = await supabase
        .from('lands')
        .select(`
          id,
          tenant_id,
          farmer_id,
          name,
          survey_number,
          area_acres,
          area_guntas,
          village,
          taluka,
          district,
          state,
          soil_type,
          land_type,
          water_source,
          irrigation_source,
          ownership_type,
          current_crop,
          crop_stage,
          last_sowing_date,
          expected_harvest_date,
          last_ndvi_value,
          last_ndvi_calculation,
          ndvi_thumbnail_url,
          created_at,
          updated_at
        `)
        .eq('tenant_id', currentTenant.id)
        .eq('farmer_id', farmerId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as FarmerLand[];
    },
    enabled: !!currentTenant?.id && !!farmerId,
    staleTime: 10000,
  });

  // Calculate stats
  const stats: FarmerLandsStats = {
    totalLands: lands?.length || 0,
    totalAreaAcres: lands?.reduce((sum, l) => sum + (l.area_acres || 0), 0) || 0,
    irrigatedArea: lands
      ?.filter(l => l.irrigation_source && l.irrigation_source !== 'rainfed')
      .reduce((sum, l) => sum + (l.area_acres || 0), 0) || 0,
    uniqueCrops: [...new Set(lands?.map(l => l.current_crop).filter(Boolean) as string[])],
    averageNDVI: lands?.filter(l => l.last_ndvi_value !== null).length 
      ? lands.filter(l => l.last_ndvi_value !== null).reduce((sum, l) => sum + (l.last_ndvi_value || 0), 0) / lands.filter(l => l.last_ndvi_value !== null).length
      : null,
    landsWithNDVI: lands?.filter(l => l.last_ndvi_value !== null).length || 0,
  };

  // Real-time subscription
  useEffect(() => {
    if (!currentTenant?.id || !farmerId) return;

    const channel = supabase
      .channel(`farmer_lands_${farmerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lands',
          filter: `farmer_id=eq.${farmerId}`,
        },
        () => {
          setIsLive(true);
          queryClient.invalidateQueries({ queryKey });
          setTimeout(() => setIsLive(false), 2000);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentTenant?.id, farmerId, queryClient, queryKey]);

  return {
    lands,
    stats,
    isLoading,
    error,
    isLive,
    refetch,
  };
};
