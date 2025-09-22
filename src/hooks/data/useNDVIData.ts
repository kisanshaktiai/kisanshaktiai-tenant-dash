import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';

export interface NDVIDataRow {
  id: string;
  land_id: string;
  ndvi_value: number;
  evi_value: number;
  ndwi_value: number;
  savi_value: number;
  image_url: string | null;
  date: string;
  created_at: string;
}

export interface VegetationSnapshot {
  ndvi: number;
  evi: number;
  ndwi: number;
  savi: number;
  imageUrl: string | null;
  capturedDate: string;
  trend: 'up' | 'down' | 'stable';
}

export const useNDVIData = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();

  const fetchNDVIData = async (): Promise<VegetationSnapshot | null> => {
    if (!currentTenant?.id || !farmerId) {
      return null;
    }

    // Get farmer's active lands
    const { data: lands, error: landsError } = await supabase
      .from('lands')
      .select('id')
      .eq('farmer_id', farmerId)
      .eq('tenant_id', currentTenant.id)
      .eq('is_active', true);

    if (landsError || !lands || lands.length === 0) {
      console.log('No active lands found for farmer:', farmerId);
      return null;
    }

    const landIds = lands.map(l => l.id);

    // Get latest NDVI data for farmer's lands
    const { data: ndviData, error: ndviError } = await supabase
      .from('ndvi_data')
      .select('*')
      .in('land_id', landIds)
      .order('date', { ascending: false })
      .limit(1);

    if (ndviError || !ndviData || ndviData.length === 0) {
      console.log('No NDVI data found for farmer lands');
      return null;
    }

    const latest = ndviData[0];

    // Get historical data for trend calculation
    const { data: historicalData } = await supabase
      .from('ndvi_data')
      .select('ndvi_value, date')
      .in('land_id', landIds)
      .order('date', { ascending: false })
      .limit(10);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (historicalData && historicalData.length > 1) {
      const recentAvg = historicalData.slice(0, 3).reduce((sum, d) => sum + d.ndvi_value, 0) / 3;
      const olderAvg = historicalData.slice(-3).reduce((sum, d) => sum + d.ndvi_value, 0) / 3;
      
      if (recentAvg > olderAvg + 0.05) trend = 'up';
      else if (recentAvg < olderAvg - 0.05) trend = 'down';
    }

    return {
      ndvi: latest.ndvi_value,
      evi: latest.evi_value,
      ndwi: latest.ndwi_value,
      savi: latest.savi_value,
      imageUrl: latest.image_url,
      capturedDate: latest.date,
      trend
    };
  };

  const query = useQuery({
    queryKey: ['ndvi-data', currentTenant?.id, farmerId],
    queryFn: fetchNDVIData,
    enabled: !!currentTenant?.id && !!farmerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  // Real-time subscription
  useEffect(() => {
    if (!currentTenant?.id || !farmerId) return;

    const channel = supabase
      .channel(`ndvi-updates-${farmerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ndvi_data'
        },
        (payload) => {
          // Check if the new data is for this farmer's lands
          queryClient.invalidateQueries({ 
            queryKey: ['ndvi-data', currentTenant.id, farmerId] 
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, farmerId, queryClient]);

  return query;
};

export const useNDVITimeSeries = (farmerId: string, days: number = 30) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const fetchTimeSeries = async () => {
    if (!currentTenant?.id || !farmerId) {
      return [];
    }

    // Get farmer's lands
    const { data: lands } = await supabase
      .from('lands')
      .select('id')
      .eq('farmer_id', farmerId)
      .eq('tenant_id', currentTenant.id);

    if (!lands || lands.length === 0) return [];

    const landIds = lands.map(l => l.id);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get NDVI time series data
    const { data, error } = await supabase
      .from('ndvi_data')
      .select('ndvi_value, evi_value, ndwi_value, savi_value, date')
      .in('land_id', landIds)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true });

    if (error || !data) return [];

    // Aggregate by date if multiple lands
    const aggregated = data.reduce((acc: any, curr) => {
      const date = curr.date.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          ndvi: [],
          evi: [],
          ndwi: [],
          savi: []
        };
      }
      acc[date].ndvi.push(curr.ndvi_value);
      acc[date].evi.push(curr.evi_value);
      acc[date].ndwi.push(curr.ndwi_value);
      acc[date].savi.push(curr.savi_value);
      return acc;
    }, {});

    // Calculate averages
    return Object.values(aggregated).map((item: any) => ({
      date: item.date,
      ndvi: item.ndvi.reduce((a: number, b: number) => a + b, 0) / item.ndvi.length,
      evi: item.evi.reduce((a: number, b: number) => a + b, 0) / item.evi.length,
      ndwi: item.ndwi.reduce((a: number, b: number) => a + b, 0) / item.ndwi.length,
      savi: item.savi.reduce((a: number, b: number) => a + b, 0) / item.savi.length,
    }));
  };

  return useQuery({
    queryKey: ['ndvi-timeseries', currentTenant?.id, farmerId, days],
    queryFn: fetchTimeSeries,
    enabled: !!currentTenant?.id && !!farmerId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};