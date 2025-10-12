import { useQuery } from '@tanstack/react-query';

export interface LandNDVIData {
  id: string;
  tenant_id: string;
  land_id: string;
  tile_id: string;
  date: string;
  ndvi_value: number;
  ndvi_min: number;
  ndvi_max: number;
  ndvi_std: number;
  coverage: number;
  created_at: string;
  metadata: any;
}

/**
 * Hook to fetch NDVI data for a specific land from API v3.6
 * GET /lands/{land_id}/ndvi?tenant_id={id}&limit={n}
 */
export const useLandNDVI = (landId: string, tenantId?: string, limit: number = 30) => {
  return useQuery({
    queryKey: ['land-ndvi', landId, tenantId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tenantId) params.append('tenant_id', tenantId);
      params.append('limit', limit.toString());
      
      const response = await fetch(
        `https://ndvi-land-api.onrender.com/lands/${landId}/ndvi?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch NDVI data: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Returns: { land_id, count, data: [...], timestamp }
      return result.data as LandNDVIData[];
    },
    enabled: !!landId, // Only fetch when landId is provided
  });
};
