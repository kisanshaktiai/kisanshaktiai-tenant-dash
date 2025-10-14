import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';

export interface RealTimeNDVIData {
  id: string;
  land_id: string;
  tenant_id: string;
  ndvi_value: number;
  evi_value: number;
  ndwi_value: number;
  savi_value: number;
  ndvi_min: number;
  ndvi_max: number;
  ndvi_std: number;
  coverage: number;
  confidence?: number;
  date: string;
  image_url: string | null;
  created_at: string;
  // Additional fields from actual table
  cloud_cover?: number;
  cloud_coverage?: number;
  collection_id?: string;
  computed_at?: string;
  coverage_percentage?: number;
  evi_max?: number;
  evi_mean?: number;
  evi_min?: number;
  evi_std?: number;
  false_color_image_url?: string;
  gci_value?: number;
  id_in_source_db?: number;
  latest?: boolean;
  location_context?: any;
  mgrs_tile?: string;
  ndre_value?: number;
  ndvi_mean?: number;
  ndwi_max?: number;
  ndwi_mean?: number;
  ndwi_min?: number;
  ndwi_std?: number;
  observation_id?: string;
  processed_at?: string;
  processing_quality?: string;
  satellite_source?: string;
  savi_max?: number;
  savi_mean?: number;
  savi_min?: number;
  savi_std?: number;
  updated_at?: string;
  lands: {
    id: string;
    land_name: string;
    farmer_id: string;
    farmers: {
      id: string;
      user_profile: {
        id: string;
        full_name: string;
      } | null;
    } | null;
  } | null;
}

export interface NDVIStats {
  total_lands: number;
  average_ndvi: number;
  max_ndvi: number;
  min_ndvi: number;
  lands_with_data: number;
  latest_update: string;
  coverage_km2: number;
}

/**
 * Hook to fetch real-time NDVI data from Supabase
 */
export const useRealTimeNDVIData = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();

  // Fetch latest NDVI data for all lands
  const { data: ndviData, isLoading, error, refetch } = useQuery({
    queryKey: ['ndvi-realtime-data', currentTenant?.id],
    queryFn: async (): Promise<RealTimeNDVIData[]> => {
      if (!currentTenant?.id) return [];

      const { data, error } = await supabase
        .from('ndvi_data')
        .select(`
          *,
          lands!inner(
            id,
            land_name,
            farmer_id,
            farmers!inner(
              id,
              user_profile:user_profiles!inner(
                id,
                full_name
              )
            )
          )
        `)
        .eq('tenant_id', currentTenant.id)
        .order('date', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!currentTenant?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Calculate statistics from real-time data
  const stats: NDVIStats | null = ndviData
    ? {
        total_lands: new Set(ndviData.map((d) => d.land_id)).size,
        average_ndvi:
          ndviData.reduce((sum, d) => sum + d.ndvi_value, 0) / Math.max(ndviData.length, 1),
        max_ndvi: Math.max(...ndviData.map((d) => d.ndvi_value), 0),
        min_ndvi: Math.min(...ndviData.map((d) => d.ndvi_value), 1),
        lands_with_data: new Set(ndviData.map((d) => d.land_id)).size,
        latest_update: ndviData[0]?.date || new Date().toISOString(),
        coverage_km2: ndviData.reduce((sum, d) => sum + (d.coverage || 0), 0) / 1000000, // m² to km²
      }
    : null;

  // Real-time subscription to ndvi_data table
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel(`ndvi-realtime-${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ndvi_data',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          console.log('NDVI data changed:', payload);
          // Invalidate and refetch on any change
          queryClient.invalidateQueries({ queryKey: ['ndvi-realtime-data', currentTenant.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, queryClient]);

  // Get latest data grouped by land
  const landData = ndviData
    ? Object.values(
        ndviData.reduce((acc, item) => {
          if (!acc[item.land_id] || new Date(item.date) > new Date(acc[item.land_id].date)) {
            acc[item.land_id] = item;
          }
          return acc;
        }, {} as Record<string, RealTimeNDVIData>)
      ).sort((a, b) => b.ndvi_value - a.ndvi_value)
    : [];

  return {
    ndviData,
    landData,
    stats,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch NDVI queue status from Supabase
 */
export const useNDVIQueueStatus = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();

  const { data: queueStatus, isLoading, error } = useQuery({
    queryKey: ['ndvi-queue-status', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;

      const { data, error } = await supabase
        .from('ndvi_request_queue')
        .select('status')
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      const statusCount = (data || []).reduce((acc: any, item: any) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});

      return {
        queued: statusCount.queued || 0,
        processing: statusCount.processing || 0,
        completed: statusCount.completed || 0,
        failed: statusCount.failed || 0,
        total: data?.length || 0,
      };
    },
    enabled: !!currentTenant?.id,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Real-time subscription to queue status
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel(`ndvi-queue-${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ndvi_request_queue',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ndvi-queue-status', currentTenant.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, queryClient]);

  return {
    queueStatus,
    isLoading,
    error,
  };
};
