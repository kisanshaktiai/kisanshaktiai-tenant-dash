import React, { useEffect } from 'react';
import { NDVIGlobalDashboard } from '@/components/ndvi/NDVIGlobalDashboard';
import { RenderServiceStatus } from '@/components/ndvi/RenderServiceStatus';
import { NDVILandDataTable } from '@/components/ndvi/NDVILandDataTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Satellite, TrendingUp, Database, AlertCircle, Server, RefreshCw } from 'lucide-react';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Satellite className="w-8 h-8 text-primary" />
            NDVI Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage Normalized Difference Vegetation Index data across all farmers
          </p>
        </div>
        
        {/* Manual Refresh Button */}
        <Button
          onClick={() => manualRefresh()}
          disabled={isRefreshing || isAutoFetching}
          size="lg"
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
      <Tabs defaultValue="data" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 max-w-4xl">
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            NDVI Data
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="render" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            Render Service
          </TabsTrigger>
          <TabsTrigger value="harvest" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Harvest Queue
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* NDVI Data Tab - PRIMARY TAB */}
        <TabsContent value="data" className="space-y-6">
          <NDVILandDataTable 
            data={cachedData} 
            isLoading={isLoading || isAutoFetching} 
          />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <NDVIGlobalDashboard />
        </TabsContent>

        <TabsContent value="render" className="space-y-6">
          <RenderServiceStatus />
        </TabsContent>

        <TabsContent value="harvest" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Harvest Queue Management</h2>
            <p className="text-muted-foreground">
              View and manage satellite data harvesting operations across all farmer lands.
            </p>
            {/* Add harvest queue management UI here */}
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">NDVI Analytics</h2>
            <p className="text-muted-foreground">
              Analyze vegetation health trends and patterns across your farmer network.
            </p>
            {/* Add NDVI analytics UI here */}
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Health Alerts</h2>
            <p className="text-muted-foreground">
              Configure and manage alerts for critical vegetation health changes.
            </p>
            {/* Add alerts management UI here */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}