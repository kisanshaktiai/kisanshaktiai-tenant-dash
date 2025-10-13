import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Satellite, Download, CheckCircle, AlertCircle, Loader2, MapPin, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { renderNDVIService } from '@/services/RenderNDVIService';
import { ndviLandService } from '@/services/NDVILandService';

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

  // Get Render API statistics
  const { data: apiStats } = useQuery({
    queryKey: ['ndvi-global-stats'],
    queryFn: () => renderNDVIService.getGlobalStats(),
    enabled: !!currentTenant?.id
  });

  // Trigger NDVI harvest for selected lands via Render API
  const harvestMutation = useMutation({
    mutationFn: async () => {
      if (!currentTenant?.id) {
        throw new Error('Missing tenant ID');
      }

      // Queue NDVI requests for selected lands (or all if none selected)
      const landIds = selectedLands.length > 0 ? selectedLands : undefined;
      await ndviLandService.fetchNDVIForLands(currentTenant.id, undefined, true);

      return { success: true, landIds };
    },
    onSuccess: () => {
      toast.success('NDVI requests queued successfully! Use "Process Queue" to fetch data.');
      queryClient.invalidateQueries({ queryKey: ['ndvi-queue-status'] });
      queryClient.invalidateQueries({ queryKey: ['ndvi-data'] });
      setSelectedLands([]);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to queue NDVI requests');
    }
  });

  // Get all NDVI requests (replaces old queue status)
  const { data: ndviRequests } = useQuery({
    queryKey: ['ndvi-requests', currentTenant?.id],
    queryFn: () => renderNDVIService.getRequests(currentTenant?.id),
    enabled: !!currentTenant?.id,
    refetchInterval: 30000
  });

  // Get queue status from Render API (new structure)
  const { data: queueStatus } = useQuery({
    queryKey: ['ndvi-queue-status'],
    queryFn: () => renderNDVIService.getQueueStatus(),
    enabled: !!currentTenant?.id,
    refetchInterval: 30000 // Auto-refresh every 30 seconds
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
    if (ndviRequests && ndviRequests.requests.filter(r => r.status === 'processing').length === 0) {
      setIsProcessing(false);
    }
  }, [ndviRequests]);

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
              Queue NDVI requests via Render API for satellite imagery processing
            </CardDescription>
          </div>
          {apiStats && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">API Status</div>
              <div className="font-semibold">
                Queued: {apiStats.queued} | Processing: {apiStats.processing}
              </div>
              <Badge variant="default" className="mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                {apiStats.completed} Completed
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Processing Status */}
        {ndviRequests && ndviRequests.requests.filter(r => r.status === 'processing').length > 0 && (
          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Processing on Render API</span>
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Total: {ndviRequests.total}</span>
              <span>Processing: {ndviRequests.requests.filter(r => r.status === 'processing').length}</span>
              <span>Completed: {ndviRequests.requests.filter(r => r.status === 'completed').length}</span>
              <span className="text-destructive">Failed: {ndviRequests.requests.filter(r => r.status === 'failed').length}</span>
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
              lands.length === 0 ||
              harvestMutation.isPending ||
              isProcessing
            }
            className="flex-1"
          >
            {harvestMutation.isPending || isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Queueing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Queue NDVI Requests {selectedLands.length > 0 && `(${selectedLands.length} lands)`}
              </>
            )}
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Processing is automatic. Requests are queued and processed by the API.
          </div>
        </div>

        {/* Queue Status from Render API */}
        {ndviRequests && ndviRequests.total > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Render API Request Status</h4>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded">
                <div className="text-blue-600 dark:text-blue-400 font-semibold">
                  {ndviRequests.requests.filter(q => q.status === 'queued').length}
                </div>
                <div className="text-muted-foreground">Queued</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950 p-2 rounded">
                <div className="text-yellow-600 dark:text-yellow-400 font-semibold">
                  {ndviRequests.requests.filter(q => q.status === 'processing').length}
                </div>
                <div className="text-muted-foreground">Processing</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-2 rounded">
                <div className="text-green-600 dark:text-green-400 font-semibold">
                  {ndviRequests.requests.filter(q => q.status === 'completed').length}
                </div>
                <div className="text-muted-foreground">Completed</div>
              </div>
              <div className="bg-red-50 dark:bg-red-950 p-2 rounded">
                <div className="text-red-600 dark:text-red-400 font-semibold">
                  {ndviRequests.requests.filter(q => q.status === 'failed').length}
                </div>
                <div className="text-muted-foreground">Failed</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Queue Metrics */}
        {queueStatus && (
          <div className="p-4 border rounded-lg space-y-2">
            <h4 className="text-sm font-medium">Queue Metrics</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-muted-foreground">Queue Length</div>
                <div className="font-semibold">{queueStatus.queue_length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Processing</div>
                <div className="font-semibold">{queueStatus.processing_count}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Est. Wait</div>
                <div className="font-semibold">{queueStatus.estimated_wait_time_minutes}m</div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• NDVI requests are created via Render API (https://ndvi-land-api.onrender.com)</p>
          <p>• Requests are automatically queued and processed by the API</p>
          <p>• Data includes NDVI values with statistics for vegetation health</p>
        </div>
      </CardContent>
    </Card>
  );
};