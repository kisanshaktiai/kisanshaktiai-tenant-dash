import React, { useEffect } from 'react';
import { NDVIGlobalDashboard } from '@/components/ndvi/NDVIGlobalDashboard';
import { RenderServiceStatus } from '@/components/ndvi/RenderServiceStatus';
import { NDVILandDataTable } from '@/components/ndvi/NDVILandDataTable';
import { NDVIApiMonitoring } from '@/components/ndvi/NDVIApiMonitoring';
import { NDVIDataVisualization } from '@/components/ndvi/NDVIDataVisualization';
import { NDVIQueueStatus } from '@/components/ndvi/NDVIQueueStatus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Satellite, TrendingUp, Database, AlertCircle, Server, RefreshCw, Activity, BarChart3, MapPin } from 'lucide-react';
import { useNDVILandData } from '@/hooks/data/useNDVILandData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageLayout } from '@/components/layout/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NDVIQueueCleanupService } from '@/services/NDVIQueueCleanupService';

export default function NDVIPage() {
  const queryClient = useQueryClient();
  const {
    cachedData,
    isLoading,
    autoFetch,
    isAutoFetching,
    manualRefresh,
    isRefreshing,
    error,
    refetch: refetchData,
  } = useNDVILandData();

  // Mutation to trigger NDVI processing worker on Render
  const processQueueMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('https://ndvi-land-api.onrender.com/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 10,
          use_queue: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger worker: ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ NDVI Processing Started",
        description: `${data.jobs_triggered || 0} job(s) triggered on Render worker`,
      });

      // Auto-refresh queue status after a few seconds
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['ndvi-queue-status'] });
      }, 3000);

      // Refetch NDVI data after processing completes (wait a bit longer)
      setTimeout(() => {
        refetchData();
      }, 10000);
    },
    onError: (error: Error) => {
      console.error('❌ Failed to trigger worker:', error);
      toast({
        title: 'Processing Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation to assign MGRS tiles to lands
  const assignTilesMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('assign_mgrs_tile_to_land');
      if (error) throw error;
      return data as { 
        success: boolean; 
        message: string; 
        inserted: number; 
        updated: number; 
        skipped: number;
        errors: number;
        error_details: Array<{
          land_id: string;
          land_name: string;
          reason?: string;
          centroid?: string;
          error_code?: string;
          error_message?: string;
        }>;
      };
    },
    onSuccess: (result) => {
      console.log('Tile assignment result:', result);
      
      if (result.error_details && result.error_details.length > 0) {
        console.error('Tile assignment details:', result.error_details);
        toast({
          title: 'Tile Assignment Issues',
          description: `${result.message}. Check console for detailed error information.`,
          variant: result.errors > 0 ? 'destructive' : 'default',
        });
      } else {
        toast({
          title: 'Tile Assignment Complete',
          description: result?.message || 'Successfully assigned MGRS tiles to lands',
        });
      }
    },
    onError: (error: Error) => {
      console.error('Tile assignment error:', error);
      toast({
        title: 'Tile Assignment Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Check if lands exist and are mapped
  const { data: diagnostics } = useQuery({
    queryKey: ['ndvi-diagnostics'],
    queryFn: async () => {
      // Check for lands with boundaries
      const { data: lands, error: landsError } = await supabase
        .from('lands')
        .select('id, name, boundary')
        .eq('is_active', true)
        .limit(1);

      // Check for tile mappings
      const { data: mappings, error: mappingsError } = await supabase
        .from('land_tile_mapping')
        .select('land_id, tile_id')
        .limit(1);

      return {
        hasLands: (lands && lands.length > 0) || false,
        hasLandsWithBoundaries: (lands && lands.length > 0 && lands[0].boundary) || false,
        hasTileMappings: (mappings && mappings.length > 0) || false,
      };
    },
  });

  // Auto-fetch NDVI data on page load (respects 7-day cache)
  useEffect(() => {
    autoFetch();
    
    // Clean up invalid queue records on initial load
    NDVIQueueCleanupService.markInvalidRecordsAsFailed().then((result) => {
      if (result.updated > 0) {
        console.log(`🔧 Cleaned up ${result.updated} invalid queue records`);
      }
    });
  }, []);

  return (
    <PageLayout maxWidth="none" padding="md">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Satellite className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
              </div>
              <h1 className="text-2xl lg:text-4xl font-bold text-foreground">
                NDVI Management Center
              </h1>
            </div>
            <p className="text-sm lg:text-base text-muted-foreground">
              Real-time satellite vegetation monitoring powered by NDVI Land Processor API
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => assignTilesMutation.mutate()}
              disabled={assignTilesMutation.isPending}
              variant="outline"
              size="default"
              className="shadow-sm"
            >
              <MapPin className={`h-4 w-4 mr-2 ${assignTilesMutation.isPending ? 'animate-pulse' : ''}`} />
              {assignTilesMutation.isPending ? 'Assigning...' : 'Assign Tiles'}
            </Button>
            
            <Button
              onClick={() => manualRefresh()}
              disabled={isRefreshing || isAutoFetching}
              size="default"
              className="shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Queueing...' : 'Queue NDVI Jobs'}
            </Button>

            <Button
              onClick={() => processQueueMutation.mutate()}
              disabled={processQueueMutation.isPending}
              variant="secondary"
              size="default"
              className="shadow-sm"
            >
              <Server className={`h-4 w-4 mr-2 ${processQueueMutation.isPending ? 'animate-spin' : ''}`} />
              {processQueueMutation.isPending ? 'Processing...' : 'Process Queue'}
            </Button>
          </div>
        </div>

        {/* Status Alerts */}
        {isAutoFetching && (
          <Alert className="border-primary/20 bg-primary/5">
            <Satellite className="h-4 w-4 animate-pulse text-primary" />
            <AlertTitle>Queueing NDVI Requests</AlertTitle>
            <AlertDescription>
              Submitting NDVI requests to the Render API for processing...
            </AlertDescription>
          </Alert>
        )}

        {isRefreshing && (
          <Alert className="border-primary/20 bg-primary/5">
            <Server className="h-4 w-4 animate-pulse text-primary" />
            <AlertTitle>Queueing NDVI Requests</AlertTitle>
            <AlertDescription>
              Submitting land parcels to NDVI processing queue on Render...
            </AlertDescription>
          </Alert>
        )}

        {processQueueMutation.isPending && (
          <Alert className="border-primary/20 bg-primary/5">
            <Server className="h-4 w-4 animate-spin text-primary" />
            <AlertTitle>Processing Queue</AlertTitle>
            <AlertDescription>
              Triggering NDVI worker on Render to process queued jobs...
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to Fetch NDVI Data</AlertTitle>
            <AlertDescription>
              {error.message || 'An error occurred while fetching NDVI data. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Smart error/status messages based on actual system state */}
        {!isLoading && !isAutoFetching && !error && (!cachedData || cachedData.length === 0) && (
          <>
            {!diagnostics?.hasLands && (
              <Alert className="border-muted-foreground/20">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Lands Found</AlertTitle>
                <AlertDescription>
                  No land parcels exist in your system. Please go to the Farmers section and add land parcels with GPS coordinates or boundary polygons.
                </AlertDescription>
              </Alert>
            )}
            
            {diagnostics?.hasLands && !diagnostics?.hasLandsWithBoundaries && (
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Missing Boundary Data</AlertTitle>
                <AlertDescription>
                  Your land parcels exist but don't have boundary data (GPS coordinates or polygons). Please edit your lands to add location information.
                </AlertDescription>
              </Alert>
            )}
            
            {diagnostics?.hasLandsWithBoundaries && !diagnostics?.hasTileMappings && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Tiles Not Assigned</AlertTitle>
                <AlertDescription>
                  Your lands have boundaries but aren't mapped to satellite tiles yet. Click the "Assign Tiles" button above to map them automatically.
                </AlertDescription>
              </Alert>
            )}
            
            {diagnostics?.hasTileMappings && (
              <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                <AlertCircle className="h-4 w-4 text-purple-600" />
                <AlertTitle>No NDVI Data Yet</AlertTitle>
                <AlertDescription>
                  Your lands are mapped to tiles, but no NDVI data has been processed yet. Click "Queue NDVI Jobs" to submit requests to Render API, then "Process Queue" to trigger the worker and retrieve results.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Queue Status - Always show when not loading */}
        {!isLoading && <NDVIQueueStatus />}

        {/* Main Content Tabs */}
        <Card className="border-muted">
          <Tabs defaultValue="monitoring" className="w-full">
            <div className="border-b px-4 pt-4">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-1 bg-transparent p-0">
                <TabsTrigger 
                  value="monitoring" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-3 py-2"
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">API Monitoring</span>
                  <span className="sm:hidden">Monitor</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="visualization" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-3 py-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Visualization</span>
                  <span className="sm:hidden">Charts</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="data" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-3 py-2"
                >
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">NDVI Data</span>
                  <span className="sm:hidden">Data</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-3 py-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 lg:p-6">
              {/* API Monitoring Tab */}
              <TabsContent value="monitoring" className="space-y-4 mt-0">
                <NDVIApiMonitoring />
              </TabsContent>

              {/* Data Visualization Tab */}
              <TabsContent value="visualization" className="space-y-4 mt-0">
                <NDVIDataVisualization data={cachedData || []} />
              </TabsContent>

              {/* NDVI Data Tab */}
              <TabsContent value="data" className="space-y-4 mt-0">
                <NDVILandDataTable 
                  data={cachedData} 
                  isLoading={isLoading || isAutoFetching} 
                />
              </TabsContent>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-4 mt-0">
                <NDVIGlobalDashboard />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </PageLayout>
  );
}