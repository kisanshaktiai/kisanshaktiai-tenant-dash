import React, { useEffect } from 'react';
import { NDVIGlobalDashboard } from '@/components/ndvi/NDVIGlobalDashboard';
import { RenderServiceStatus } from '@/components/ndvi/RenderServiceStatus';
import { NDVILandDataTable } from '@/components/ndvi/NDVILandDataTable';
import { NDVIApiMonitoring } from '@/components/ndvi/NDVIApiMonitoring';
import { NDVIDataVisualization } from '@/components/ndvi/NDVIDataVisualization';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Satellite, TrendingUp, Database, AlertCircle, Server, RefreshCw, Activity, BarChart3, MapPin } from 'lucide-react';
import { useNDVILandData } from '@/hooks/data/useNDVILandData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageLayout } from '@/components/layout/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

export default function NDVIPage() {
  const {
    cachedData,
    isLoading,
    autoFetch,
    isAutoFetching,
    manualRefresh,
    isRefreshing,
    error,
  } = useNDVILandData();

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

  // Auto-fetch NDVI data on page load (respects 7-day cache)
  useEffect(() => {
    autoFetch();
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
              {isRefreshing ? 'Refreshing...' : 'Refresh NDVI'}
            </Button>
          </div>
        </div>

        {/* Status Alerts */}
        {isAutoFetching && (
          <Alert className="border-primary/20 bg-primary/5">
            <Satellite className="h-4 w-4 animate-pulse text-primary" />
            <AlertTitle>Fetching NDVI Data</AlertTitle>
            <AlertDescription>
              Checking for updates and fetching fresh satellite data where needed...
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

        {!isLoading && !isAutoFetching && !error && (!cachedData || cachedData.length === 0) && (
          <Alert className="border-muted-foreground/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Land Data Available</AlertTitle>
            <AlertDescription>
              No land parcels found with boundary data. Please add land parcels with GPS coordinates 
              or boundary polygons in the Farmers section, then click "Assign Tiles" to map them to MGRS tiles.
            </AlertDescription>
          </Alert>
        )}

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