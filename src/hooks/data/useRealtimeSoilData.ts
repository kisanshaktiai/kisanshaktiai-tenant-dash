import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

export interface SoilHealthData {
  id: string;
  land_id: string;
  tenant_id: string;
  farmer_id: string;
  test_date: string;
  ph_level: number | null;
  organic_carbon: number | null;
  nitrogen_kg_per_ha: number | null;
  phosphorus_kg_per_ha: number | null;
  potassium_kg_per_ha: number | null;
  nitrogen_total_kg: number | null;
  phosphorus_total_kg: number | null;
  potassium_total_kg: number | null;
  texture: string | null;
  field_area_ha: number | null;
  source: string;
}

export interface LandWithSoilHealth {
  id: string;
  name: string;
  farmer_id: string;
  tenant_id: string;
  area_acres: number;
  area_guntas: number | null;
  village: string | null;
  taluka: string | null;
  district: string | null;
  soil_health: SoilHealthData[];
  farmer?: {
    id: string;
    farmer_name: string | null;
    mobile_number: string | null;
  };
}

export const useRealtimeSoilData = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  // Fetch lands with soil health data
  const { data: landsWithSoil, isLoading, refetch } = useQuery<LandWithSoilHealth[]>({
    queryKey: ['lands-with-soil-realtime', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];

      const { data, error } = await supabase
        .from('lands')
        .select(`
          id,
          name,
          farmer_id,
          tenant_id,
          area_acres,
          area_guntas,
          village,
          taluka,
          district,
          soil_health (
            id,
            land_id,
            tenant_id,
            farmer_id,
            test_date,
            ph_level,
            organic_carbon,
            nitrogen_kg_per_ha,
            phosphorus_kg_per_ha,
            potassium_kg_per_ha,
            nitrogen_total_kg,
            phosphorus_total_kg,
            potassium_total_kg,
            texture,
            field_area_ha,
            source
          ),
          farmer:farmers!inner (
            id,
            farmer_name,
            mobile_number
          )
        `)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any as LandWithSoilHealth[];
    },
    enabled: !!currentTenant?.id,
    staleTime: 0,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel(`soil_data_${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'soil_health',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          console.log('[RealtimeSoil] soil_health change:', payload);
          queryClient.invalidateQueries({ queryKey: ['lands-with-soil-realtime', currentTenant.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lands',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          console.log('[RealtimeSoil] lands change:', payload);
          queryClient.invalidateQueries({ queryKey: ['lands-with-soil-realtime', currentTenant.id] });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentTenant, queryClient]);

  return {
    landsWithSoil,
    isLoading,
    refetch,
  };
};
