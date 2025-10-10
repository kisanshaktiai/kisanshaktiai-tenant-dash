import React, { useEffect } from 'react';
import { NDVIGlobalDashboard } from '@/components/ndvi/NDVIGlobalDashboard';
import { RenderServiceStatus } from '@/components/ndvi/RenderServiceStatus';
import { NDVILandDataTable } from '@/components/ndvi/NDVILandDataTable';
import { NDVIApiMonitoring } from '@/components/ndvi/NDVIApiMonitoring';
import { NDVIDataVisualization } from '@/components/ndvi/NDVIDataVisualization';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Satellite, TrendingUp, Database, AlertCircle, Server, RefreshCw, Activity, BarChart3 } from 'lucide-react';
import { useNDVILandData } from '@/hooks/data/useNDVILandData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function NDVIPage() {
  const {
    cachedData,
    isLoading,
    autoFetch,
    isAutoFetching,
    manualRefresh,
    isRefreshing,
  } = useNDVILandData();

  // Auto-fetch NDVI data on page load (respects 7-day cache)
  useEffect(() => {
    autoFetch();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Satellite className="w-8 h-8 text-primary" />
            </div>
            NDVI Management Center
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time satellite vegetation monitoring powered by NDVI Land Processor API
          </p>
        </div>
        
        {/* Manual Refresh Button */}
        <Button
          onClick={() => manualRefresh()}
          disabled={isRefreshing || isAutoFetching}
          size="lg"
          className="shadow-lg hover-scale"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh NDVI Now'}
        </Button>
      </div>

      {/* Auto-fetch Status Alert */}
      {isAutoFetching && (
        <Alert>
          <Satellite className="h-4 w-4 animate-pulse" />
          <AlertTitle>Fetching NDVI Data</AlertTitle>
          <AlertDescription>
            Checking for updates and fetching fresh satellite data where needed...
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto shadow-md">
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            API Monitoring
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Data Visualization
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            NDVI Data
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        {/* API Monitoring Tab - NEW PRIMARY TAB */}
        <TabsContent value="monitoring" className="space-y-6">
          <NDVIApiMonitoring />
        </TabsContent>

        {/* Data Visualization Tab - NEW */}
        <TabsContent value="visualization" className="space-y-6">
          <NDVIDataVisualization data={cachedData || []} />
        </TabsContent>

        {/* NDVI Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <NDVILandDataTable 
            data={cachedData} 
            isLoading={isLoading || isAutoFetching} 
          />
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <NDVIGlobalDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}