import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Satellite, Download, CheckCircle, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface LandData {
  id: string;
  name: string;
  area_acres: number;
  farmer_id: string;
}

interface QuotaData {
  can_harvest: boolean;
  current_usage: number;
  monthly_limit: number;
}

export const NDVIHarvestManager: React.FC = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const [selectedLands, setSelectedLands] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch active lands for the tenant
  const { data: lands = [], isLoading: landsLoading } = useQuery({
    queryKey: ['tenant-lands', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      
      const { data, error } = await supabase
        .from('lands')
        .select('id, name, area_acres, farmer_id')
        .eq('tenant_id', currentTenant.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return (data || []) as LandData[];
    },
    enabled: !!currentTenant?.id
  });

  // Get harvest quota status
  const { data: quota } = useQuery({
    queryKey: ['harvest-quota', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      
      const { data, error } = await supabase
        .rpc('check_harvest_quota', { p_tenant_id: currentTenant.id });
      
      if (error) throw error;
      return (data as unknown) as QuotaData | null;
    },
    enabled: !!currentTenant?.id
  });

  // Get tenant tiles for harvesting
  const { data: tilesData } = useQuery({
    queryKey: ['tenant-tiles', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      
      const response = await supabase.functions.invoke('ndvi-harvest', {
        body: {
          action: 'get_tenant_tiles',
          tenant_id: currentTenant.id
        }
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
    enabled: !!currentTenant?.id
  });

  // Trigger NDVI harvest for selected lands
  const harvestMutation = useMutation({
    mutationFn: async () => {
      if (!currentTenant?.id || !tilesData?.tiles) {
        throw new Error('Missing required data');
      }

      // Get unique tile IDs that cover selected lands
      const tileIds = [...new Set(tilesData.tiles.map((t: any) => t.tile_id))];
      
      // Step 1: Trigger satellite data harvest
      const harvestResponse = await supabase.functions.invoke('ndvi-harvest', {
        body: {
          action: 'trigger_harvest',
          tenant_id: currentTenant.id,
          tile_ids: tileIds,
          params: {
            priority: 1,
            requested_date: new Date().toISOString().split('T')[0]
          }
        }
      });

      if (harvestResponse.error) throw harvestResponse.error;

      // Step 2: Create land clipping jobs for each tile
      for (const tileId of tileIds) {
        const clippingResponse = await supabase.functions.invoke('land-clipper', {
          body: {
            action: 'create_clipping_jobs',
            tenant_id: currentTenant.id,
            land_ids: selectedLands.length > 0 ? selectedLands : undefined,
            tile_id: tileId,
            date: new Date().toISOString().split('T')[0]
          }
        });

        if (clippingResponse.error) {
          console.error('Clipping job creation failed:', clippingResponse.error);
        }
      }

      return harvestResponse.data;
    },
    onSuccess: (data) => {
      toast.success('NDVI harvest initiated successfully!');
      queryClient.invalidateQueries({ queryKey: ['harvest-quota'] });
      queryClient.invalidateQueries({ queryKey: ['ndvi-data'] });
      setSelectedLands([]);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to initiate NDVI harvest');
    }
  });

  // Check job status
  const { data: jobStatus } = useQuery({
    queryKey: ['harvest-status', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      
      const response = await supabase.functions.invoke('ndvi-harvest', {
        body: {
          action: 'get_harvest_status',
          tenant_id: currentTenant.id
        }
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
    enabled: !!currentTenant?.id,
    refetchInterval: isProcessing ? 5000 : false
  });

  const handleSelectAll = () => {
    if (selectedLands.length === lands.length) {
      setSelectedLands([]);
    } else {
      setSelectedLands(lands.map(l => l.id));
    }
  };

  const handleTriggerHarvest = () => {
    setIsProcessing(true);
    harvestMutation.mutate();
  };

  React.useEffect(() => {
    if (jobStatus?.summary && jobStatus.summary.pending === 0 && jobStatus.summary.running === 0) {
      setIsProcessing(false);
    }
  }, [jobStatus]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Satellite className="h-5 w-5" />
              NDVI Data Harvesting
            </CardTitle>
            <CardDescription>
              Fetch satellite imagery and calculate vegetation indices for your lands
            </CardDescription>
          </div>
          {quota && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Monthly Quota</div>
              <div className="font-semibold">
                {quota.current_usage} / {quota.monthly_limit}
              </div>
              {quota.can_harvest && (
                <Badge variant="default" className="mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Available
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quota Warning */}
        {quota && !quota.can_harvest && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've reached your monthly harvest limit. Quota resets on the first day of next month.
            </AlertDescription>
          </Alert>
        )}

        {/* Job Status */}
        {jobStatus?.summary && (jobStatus.summary.running > 0 || jobStatus.summary.pending > 0) && (
          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Processing Jobs</span>
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <Progress 
              value={(jobStatus.summary.completed / jobStatus.summary.total_jobs) * 100} 
            />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Pending: {jobStatus.summary.pending}</span>
              <span>Running: {jobStatus.summary.running}</span>
              <span>Completed: {jobStatus.summary.completed}</span>
              {jobStatus.summary.failed > 0 && (
                <span className="text-destructive">Failed: {jobStatus.summary.failed}</span>
              )}
            </div>
          </div>
        )}

        {/* Land Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Select Lands for NDVI Processing</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={landsLoading}
            >
              {selectedLands.length === lands.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          
          <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
            {landsLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading lands...
              </div>
            ) : lands.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No active lands found
              </div>
            ) : (
              lands.map((land) => (
                <label
                  key={land.id}
                  className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedLands.includes(land.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLands([...selectedLands, land.id]);
                      } else {
                        setSelectedLands(selectedLands.filter(id => id !== land.id));
                      }
                    }}
                    className="rounded"
                  />
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium">{land.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({land.area_acres.toFixed(2)} acres)
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleTriggerHarvest}
            disabled={
              !quota?.can_harvest || 
              (selectedLands.length === 0 && lands.length === 0) ||
              harvestMutation.isPending ||
              isProcessing
            }
            className="flex-1"
          >
            {harvestMutation.isPending || isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Fetch NDVI Data {selectedLands.length > 0 && `(${selectedLands.length} lands)`}
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• NDVI data will be fetched from satellite imagery (Sentinel-2)</p>
          <p>• Processing typically takes 5-10 minutes per land</p>
          <p>• Data includes NDVI, EVI, NDWI, and SAVI indices</p>
        </div>
      </CardContent>
    </Card>
  );
};