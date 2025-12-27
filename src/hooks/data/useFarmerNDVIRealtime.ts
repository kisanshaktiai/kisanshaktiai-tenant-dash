import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

export interface NDVIRecord {
  id: string;
  land_id: string;
  tenant_id: string;
  date: string;
  ndvi_value: number | null;
  evi_value: number | null;
  ndwi_value: number | null;
  savi_value: number | null;
  ndvi_min: number | null;
  ndvi_max: number | null;
  coverage: number | null;
  cloud_cover: number | null;
  image_url: string | null;
  satellite_source: string | null;
  collection_id: string | null;
  created_at: string;
}

export interface NDVIFullViewRecord {
  ndvi_id: string;
  tenant_id: string;
  land_id: string;
  date: string;
  ndvi_value: number | null;
  evi_value: number | null;
  ndwi_value: number | null;
  savi_value: number | null;
  ndvi_min: number | null;
  ndvi_max: number | null;
  ndvi_std: number | null;
  coverage: number | null;
  image_url: string | null;
  cloud_cover: number | null;
  satellite_source: string | null;
  ndvi_thumbnail_url: string | null;
  // Land info
  land_name: string;
  village: string | null;
  district: string | null;
  state: string | null;
  area_acres: number | null;
  last_ndvi_value: number | null;
  last_ndvi_calculation: string | null;
  // Farmer info
  farmer_id: string;
  farmer_code: string | null;
  farmer_name: string | null;
}

export interface NDVISummary {
  currentNDVI: number | null;
  avgNDVI: number | null;
  minNDVI: number | null;
  maxNDVI: number | null;
  trend: 'up' | 'down' | 'stable';
  healthStatus: 'healthy' | 'moderate' | 'stressed';
  totalRecords: number;
  latestDate: string | null;
  landCoverage: number;
}

export const useFarmerNDVIRealtime = (farmerId: string, days: number = 90) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const [isLive, setIsLive] = useState(false);

  const queryKey = ['farmer-ndvi-realtime', currentTenant?.id, farmerId, days];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!currentTenant?.id || !farmerId) return { records: [], fullView: [] };

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get from ndvi_full_view first - it has farmer_id directly
      const { data: fullViewData, error: fullViewError } = await supabase
        .from('ndvi_full_view')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('tenant_id', currentTenant.id)
        .order('date', { ascending: false })
        .limit(200);

      if (fullViewError) throw fullViewError;

      // Get land IDs from full view to query ndvi_data
      const landIds = [...new Set((fullViewData || []).map(r => r.land_id))];
      
      let ndviData: NDVIRecord[] = [];
      if (landIds.length > 0) {
        const { data: ndviResult, error: ndviError } = await supabase
          .from('ndvi_data')
          .select('*')
          .in('land_id', landIds)
          .gte('date', startDate.toISOString().split('T')[0])
          .order('date', { ascending: false });

        if (ndviError) throw ndviError;
        ndviData = (ndviResult || []) as NDVIRecord[];
      }

      return {
        records: ndviData,
        fullView: (fullViewData || []) as NDVIFullViewRecord[],
      };
    },
    enabled: !!currentTenant?.id && !!farmerId,
    staleTime: 30000,
  });

  // Calculate summary
  const summary: NDVISummary = (() => {
    const records = data?.records || [];
    if (records.length === 0) {
      return {
        currentNDVI: null,
        avgNDVI: null,
        minNDVI: null,
        maxNDVI: null,
        trend: 'stable',
        healthStatus: 'moderate',
        totalRecords: 0,
        latestDate: null,
        landCoverage: 0,
      };
    }

    const validRecords = records.filter(r => r.ndvi_value !== null);
    const values = validRecords.map(r => r.ndvi_value!);
    
    const currentNDVI = validRecords[0]?.ndvi_value ?? null;
    const avgNDVI = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
    const minNDVI = values.length ? Math.min(...values) : null;
    const maxNDVI = values.length ? Math.max(...values) : null;

    // Calculate trend (compare first half vs second half)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (validRecords.length >= 4) {
      const half = Math.floor(validRecords.length / 2);
      const recentAvg = validRecords.slice(0, half).reduce((s, r) => s + (r.ndvi_value || 0), 0) / half;
      const olderAvg = validRecords.slice(half).reduce((s, r) => s + (r.ndvi_value || 0), 0) / (validRecords.length - half);
      if (recentAvg > olderAvg + 0.05) trend = 'up';
      else if (recentAvg < olderAvg - 0.05) trend = 'down';
    }

    // Health status
    let healthStatus: 'healthy' | 'moderate' | 'stressed' = 'moderate';
    if (currentNDVI !== null) {
      if (currentNDVI >= 0.5) healthStatus = 'healthy';
      else if (currentNDVI < 0.3) healthStatus = 'stressed';
    }

    // Land coverage (unique lands with data)
    const uniqueLands = new Set(records.map(r => r.land_id));

    return {
      currentNDVI,
      avgNDVI,
      minNDVI,
      maxNDVI,
      trend,
      healthStatus,
      totalRecords: records.length,
      latestDate: validRecords[0]?.date || null,
      landCoverage: uniqueLands.size,
    };
  })();

  // Time series data grouped by date
  const timeSeries = (() => {
    const records = data?.records || [];
    const byDate = new Map<string, { values: number[]; count: number }>();
    
    records.forEach(r => {
      if (r.ndvi_value !== null) {
        const existing = byDate.get(r.date) || { values: [], count: 0 };
        existing.values.push(r.ndvi_value);
        existing.count++;
        byDate.set(r.date, existing);
      }
    });

    return Array.from(byDate.entries())
      .map(([date, data]) => ({
        date,
        value: data.values.reduce((a, b) => a + b, 0) / data.values.length,
        min: Math.min(...data.values),
        max: Math.max(...data.values),
        count: data.count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  })();

  // Real-time subscription
  useEffect(() => {
    if (!currentTenant?.id || !farmerId) return;

    const channel = supabase
      .channel(`farmer_ndvi_${farmerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ndvi_data',
          filter: `tenant_id=eq.${currentTenant.id}`,
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
    ndviRecords: data?.records || [],
    fullViewRecords: data?.fullView || [],
    summary,
    timeSeries,
    isLoading,
    error,
    isLive,
    refetch,
  };
};
