import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

export interface SoilHealthRecord {
  id: string;
  land_id: string;
  tenant_id: string;
  farmer_id: string;
  land_name?: string;
  // Soil properties
  ph_level: number | null;
  organic_carbon: number | null;
  bulk_density: number | null;
  cec: number | null;
  // Texture
  clay_percent: number | null;
  sand_percent: number | null;
  silt_percent: number | null;
  soil_type: string | null;
  texture: string | null;
  // NPK values
  nitrogen_kg_per_ha: number | null;
  phosphorus_kg_per_ha: number | null;
  potassium_kg_per_ha: number | null;
  nitrogen_total_kg: number | null;
  phosphorus_total_kg: number | null;
  potassium_total_kg: number | null;
  nitrogen_level: string | null;
  phosphorus_level: string | null;
  potassium_level: string | null;
  // Meta
  fertility_class: string | null;
  source: string | null;
  test_date: string | null;
  test_report_url: string | null;
  field_area_ha: number | null;
  created_at: string;
}

export interface SoilHealthSummary {
  avgPH: number | null;
  avgNitrogen: number | null;
  avgPhosphorus: number | null;
  avgPotassium: number | null;
  avgOrganicCarbon: number | null;
  dominantTexture: string | null;
  totalRecords: number;
  latestTestDate: string | null;
  fertilityDistribution: Record<string, number>;
}

export const useFarmerSoilHealthRealtime = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const [isLive, setIsLive] = useState(false);

  const queryKey = ['farmer-soil-health-realtime', currentTenant?.id, farmerId];

  const { data: soilRecords, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!currentTenant?.id || !farmerId) return [];

      // Get soil health directly by farmer_id (table has farmer_id column)
      const { data, error } = await supabase
        .from('soil_health')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('farmer_id', farmerId)
        .order('test_date', { ascending: false });

      if (error) throw error;

      // Get land names for display
      if (data && data.length > 0) {
        const landIds = [...new Set(data.map(r => r.land_id))];
        const { data: lands } = await supabase
          .from('lands')
          .select('id, name')
          .in('id', landIds);
        
        const landNameMap = new Map((lands || []).map(l => [l.id, l.name]));
        
        return data.map(record => ({
          ...record,
          land_name: landNameMap.get(record.land_id),
        })) as SoilHealthRecord[];
      }

      return [] as SoilHealthRecord[];
    },
    enabled: !!currentTenant?.id && !!farmerId,
    staleTime: 30000,
  });

  // Calculate summary
  const summary: SoilHealthSummary = (() => {
    if (!soilRecords || soilRecords.length === 0) {
      return {
        avgPH: null,
        avgNitrogen: null,
        avgPhosphorus: null,
        avgPotassium: null,
        avgOrganicCarbon: null,
        dominantTexture: null,
        totalRecords: 0,
        latestTestDate: null,
        fertilityDistribution: {},
      };
    }

    const validPH = soilRecords.filter(r => r.ph_level !== null);
    const validN = soilRecords.filter(r => r.nitrogen_kg_per_ha !== null);
    const validP = soilRecords.filter(r => r.phosphorus_kg_per_ha !== null);
    const validK = soilRecords.filter(r => r.potassium_kg_per_ha !== null);
    const validOC = soilRecords.filter(r => r.organic_carbon !== null);

    // Texture frequency
    const textureCount: Record<string, number> = {};
    soilRecords.forEach(r => {
      if (r.texture) {
        textureCount[r.texture] = (textureCount[r.texture] || 0) + 1;
      }
    });
    const dominantTexture = Object.entries(textureCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Fertility distribution
    const fertilityDistribution: Record<string, number> = {};
    soilRecords.forEach(r => {
      if (r.fertility_class) {
        fertilityDistribution[r.fertility_class] = (fertilityDistribution[r.fertility_class] || 0) + 1;
      }
    });

    return {
      avgPH: validPH.length ? validPH.reduce((sum, r) => sum + (r.ph_level || 0), 0) / validPH.length : null,
      avgNitrogen: validN.length ? validN.reduce((sum, r) => sum + (r.nitrogen_kg_per_ha || 0), 0) / validN.length : null,
      avgPhosphorus: validP.length ? validP.reduce((sum, r) => sum + (r.phosphorus_kg_per_ha || 0), 0) / validP.length : null,
      avgPotassium: validK.length ? validK.reduce((sum, r) => sum + (r.potassium_kg_per_ha || 0), 0) / validK.length : null,
      avgOrganicCarbon: validOC.length ? validOC.reduce((sum, r) => sum + (r.organic_carbon || 0), 0) / validOC.length : null,
      dominantTexture,
      totalRecords: soilRecords.length,
      latestTestDate: soilRecords[0]?.test_date || null,
      fertilityDistribution,
    };
  })();

  // Real-time subscription
  useEffect(() => {
    if (!currentTenant?.id || !farmerId) return;

    const channel = supabase
      .channel(`farmer_soil_${farmerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'soil_health',
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
    soilRecords,
    summary,
    isLoading,
    error,
    isLive,
    refetch,
  };
};
