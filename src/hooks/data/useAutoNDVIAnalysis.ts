import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { renderNDVIService } from '@/services/RenderNDVIService';
import { useAppSelector } from '@/store/hooks';
import { toast } from '@/hooks/use-toast';

interface LandNeedingUpdate {
  id: string;
  farmer_id: string;
  boundary_polygon_old: any;
  updated_at: string | null;
  created_at: string;
}

export const useAutoNDVIAnalysis = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();

  // Fetch lands that need NDVI updates with smart logic
  const { data: landsNeedingUpdate = [], isLoading } = useQuery({
    queryKey: ['lands-needing-ndvi-update', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];

      console.log('🔍 Checking lands that need NDVI updates for tenant:', currentTenant.id);

      // Get all lands for this tenant with minimal safe columns
      const { data: lands, error } = await supabase
        .from('lands')
        .select('id, farmer_id, boundary_polygon_old, created_at, updated_at')
        .eq('tenant_id', currentTenant.id);

      if (error) {
        console.error('❌ Error fetching lands:', error);
        throw error;
      }

      if (!lands || lands.length === 0) {
        console.log('⚠️ No lands found for tenant');
        return [];
      }

      console.log(`📊 Total lands found: ${lands.length}`);

      // Filter lands that need updates based on intelligent criteria
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const landsNeedingUpdate = lands.filter((land) => {
        // Check if land has recent NDVI data by querying ndvi_data table
        // For now, we'll check if updated_at is old or if it's a new land
        
        // Criterion 1: Land never updated (created recently but never processed)
        const landAge = now.getTime() - new Date(land.created_at).getTime();
        const isNewLand = landAge < 7 * 24 * 60 * 60 * 1000; // Created within last 7 days
        
        if (isNewLand && (!land.updated_at || land.updated_at === land.created_at)) {
          console.log(`✅ Land ${land.id}: New land, never processed - needs update`);
          return true;
        }

        // Criterion 2: NDVI data older than 24 hours
        if (land.updated_at) {
          const lastUpdate = new Date(land.updated_at);
          if (lastUpdate < twentyFourHoursAgo) {
            console.log(`✅ Land ${land.id}: Data older than 24h (${lastUpdate.toISOString()}) - needs update`);
            return true;
          }
        } else {
          // No updated_at means it's never been processed
          console.log(`✅ Land ${land.id}: Never processed - needs update`);
          return true;
        }

        console.log(`⏭️ Land ${land.id}: Up to date - skipping`);
        return false;
      });

      console.log(`🎯 Found ${landsNeedingUpdate.length} lands needing NDVI updates`);
      return landsNeedingUpdate as LandNeedingUpdate[];
    },
    enabled: !!currentTenant?.id,
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000, // Auto-refresh every minute
  });

  // Group lands by MGRS tile for efficient batch processing
  const landsByTile = landsNeedingUpdate.reduce((acc, land) => {
    // Determine tile ID from land geometry or use default
    const tileId = determineTileFromGeometry(land.boundary_polygon_old) || '43RGN';
    
    if (!acc[tileId]) {
      acc[tileId] = [];
    }
    acc[tileId].push(land.id);
    return acc;
  }, {} as Record<string, string[]>);

  // Create NDVI requests automatically
  const createRequestMutation = useMutation({
    mutationFn: async ({ instant = false }: { instant?: boolean } = {}) => {
      if (!currentTenant?.id) throw new Error('No tenant ID available');
      if (landsNeedingUpdate.length === 0) throw new Error('No lands need updates');

      console.log(`🚀 Creating ${instant ? 'INSTANT' : 'automatic'} NDVI requests for tenant:`, currentTenant.id);
      console.log('📦 Lands grouped by tile:', landsByTile);

      const results = [];

      // Create one request per tile (batch processing)
      for (const [tileId, landIds] of Object.entries(landsByTile)) {
        console.log(`📡 Creating ${instant ? 'INSTANT' : ''} request for tile ${tileId} with ${landIds.length} lands`);
        
        try {
          const result = await renderNDVIService.createAnalysisRequest(
            currentTenant.id,
            landIds,
            tileId,
            {
              source: 'kisanshakti-dashboard',
              requested_by: instant ? 'instant-analysis' : 'auto-analysis',
              land_count: landIds.length,
              timestamp: new Date().toISOString(),
            },
            instant
          );
          results.push({ tileId, landIds: landIds.length, result });
        } catch (error) {
          console.error(`❌ Failed to create request for tile ${tileId}:`, error);
          throw error;
        }
      }

      console.log('✅ All requests created successfully:', results);
      return results;
    },
    onSuccess: (results) => {
      const totalLands = Object.values(landsByTile).reduce((sum, ids) => sum + ids.length, 0);
      const totalTiles = Object.keys(landsByTile).length;

      toast({
        title: "NDVI Analysis Queued",
        description: `${totalLands} land${totalLands !== 1 ? 's' : ''} queued across ${totalTiles} tile${totalTiles !== 1 ? 's' : ''} for analysis`,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['lands-needing-ndvi-update'] });
      queryClient.invalidateQueries({ queryKey: ['ndvi-request-queue'] });
      queryClient.invalidateQueries({ queryKey: ['ndvi-queue-status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Queue Analysis",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    landsNeedingUpdate,
    landsCount: landsNeedingUpdate.length,
    landsByTile,
    isLoading,
    createAutoRequest: createRequestMutation,
    isCreating: createRequestMutation.isPending,
  };
};

/**
 * Helper function to determine MGRS tile from geometry
 * This is a simplified version - in production, use proper coordinate conversion
 */
function determineTileFromGeometry(geometry: any): string | null {
  if (!geometry) return null;

  try {
    // Parse geometry if it's a string
    const geom = typeof geometry === 'string' ? JSON.parse(geometry) : geometry;
    
    // Extract coordinates (assuming GeoJSON format)
    const coords = geom?.coordinates?.[0]?.[0];
    if (!coords || coords.length < 2) return null;

    const [lng, lat] = coords;

    // Simplified MGRS tile detection based on coordinates
    // For India region (rough approximation)
    if (lat >= 16 && lat <= 20 && lng >= 78 && lng <= 82) return '43RGN';
    if (lat >= 20 && lat <= 24 && lng >= 78 && lng <= 82) return '43RHP';
    if (lat >= 24 && lat <= 28 && lng >= 78 && lng <= 82) return '43RJP';
    
    // Default fallback
    return '43RGN';
  } catch (error) {
    console.error('Error determining tile from geometry:', error);
    return null;
  }
}
