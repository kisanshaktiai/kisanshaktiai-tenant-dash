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
  land_name?: string;
  farmer_id?: string;
  farmer_code?: string;
  farmer_full_name?: string;
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
 * Hook to fetch real-time NDVI data from API v4.1.0
 */
export const useRealTimeNDVIData = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();

  // Fetch latest NDVI data from API v4.1.0 with retry logic for cold starts
  const { data: ndviData, isLoading, error, refetch } = useQuery({
    queryKey: ['ndvi-realtime-data', currentTenant?.id],
    queryFn: async (): Promise<RealTimeNDVIData[]> => {
      if (!currentTenant?.id) {
        console.warn('useRealTimeNDVIData: No tenant ID available');
        return [];
      }

      const url = `https://ndvi-land-api.onrender.com/api/v1/ndvi/data?tenant_id=${currentTenant.id}&limit=1000`;
      console.log('🔄 useRealTimeNDVIData: Fetching from API v4.1.0');
      console.log('   URL:', url);
      console.log('   tenant_id:', currentTenant.id);
      
      // Retry logic for cold start (Render free tier)
      let lastError: any;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API returned ${response.status}: ${errorText}`);
          }

          const result = await response.json();
          
          // v4.1.0 API response: { status: "success", count: N, data: [...] }
          if (result.status === 'success' && Array.isArray(result.data)) {
            console.log('✅ useRealTimeNDVIData: Fetched', result.data.length, 'records');
            return result.data as RealTimeNDVIData[];
          }

          console.warn('useRealTimeNDVIData: Unexpected API response format', result);
          return [];
        } catch (error: any) {
          lastError = error;
          const isColdStart = error.message?.includes('fetch') || error.message?.includes('Failed to fetch');
          
          if (isColdStart && attempt < 2) {
            const delay = 2000 * Math.pow(2, attempt); // 2s, 4s, 8s
            console.log(`🔄 Retry attempt ${attempt + 1}/3 after ${delay}ms (API warming up)`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            console.error('❌ useRealTimeNDVIData: API call failed:', error);
            throw error;
          }
        }
      }
      
      throw lastError;
    },
    enabled: !!currentTenant?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // React Query will retry once more after our internal retries
    retryDelay: 5000, // Wait 5s before React Query retry
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

  // Real-time subscription to ndvi_micro_tiles table (v4.1.0)
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel(`ndvi-realtime-${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ndvi_micro_tiles',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          console.log('NDVI micro tiles data changed:', payload);
          // Invalidate and refetch on any change
          queryClient.invalidateQueries({ queryKey: ['ndvi-realtime-data', currentTenant.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, queryClient]);

  // Get latest data grouped by land (using acquisition_date from v4.1.0)
  const landData = ndviData
    ? Object.values(
        ndviData.reduce((acc, item) => {
          const dateField = item.date || (item as any).acquisition_date;
          const existingDate = acc[item.land_id]?.date || (acc[item.land_id] as any)?.acquisition_date;
          
          if (!acc[item.land_id] || (dateField && existingDate && new Date(dateField) > new Date(existingDate))) {
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
