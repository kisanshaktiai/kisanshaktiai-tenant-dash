import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Satellite, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  BarChart3, 
  Sparkles,
  Target,
  LineChart,
  Database
} from 'lucide-react';
import { useNDVIApiMonitoring } from '@/hooks/data/useNDVIApiMonitoring';
import { useRealTimeNDVIData, useNDVIQueueStatus } from '@/hooks/data/useRealTimeNDVIData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageLayout } from '@/components/layout/PageLayout';
import { NDVIOverviewCards } from '@/components/ndvi/NDVIOverviewCards';
import { NDVIInsightsPanel } from '@/components/ndvi/NDVIInsightsPanel';
import { NDVIAnalyticsDashboard } from '@/components/ndvi/NDVIAnalyticsDashboard';
import { NDVILandPerformance } from '@/components/ndvi/NDVILandPerformance';
import { NDVIApiMonitoring } from '@/components/ndvi/NDVIApiMonitoring';

export default function NDVIPage() {
  const {
    healthData,
    healthLoading,
    globalStats,
    statsLoading,
    isHealthy,
    refetchHealth,
    refetchStats,
  } = useNDVIApiMonitoring();

  // Real-time data from Supabase
  const {
    ndviData,
    landData,
    stats: realtimeStats,
    isLoading: realtimeLoading,
    refetch: refetchRealtime,
  } = useRealTimeNDVIData();

  const { queueStatus } = useNDVIQueueStatus();

  // Manual refresh all data
  const handleRefreshAll = () => {
    refetchHealth();
    refetchStats();
    refetchRealtime();
  };

  return (
    <PageLayout maxWidth="none" padding="none">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
          <div className="relative px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <div className="relative p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                      <Satellite className="w-8 h-8 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Vegetation Intelligence Hub
                    </h1>
                    <p className="text-muted-foreground text-sm lg:text-base mt-1">
                      Real-time satellite monitoring powered by advanced NDVI analytics
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border ${
                    isHealthy 
                      ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">
                      {healthLoading ? 'Checking...' : isHealthy ? 'System Operational' : 'System Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleRefreshAll}
                  size="lg"
                  className="shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:shadow-primary/25"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="backdrop-blur-sm border-primary/20"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Set Goals
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          {/* Overview Cards */}
          <NDVIOverviewCards 
            globalStats={globalStats}
            isLoading={statsLoading || realtimeLoading}
            isHealthy={isHealthy}
            realtimeStats={realtimeStats}
          />

          {/* No Data Alert */}
          {!realtimeLoading && (!ndviData || ndviData.length === 0) && (
            <Alert className="border-primary/50 bg-primary/5">
              <Satellite className="h-4 w-4" />
              <AlertTitle>No NDVI Data Available</AlertTitle>
              <AlertDescription>
                To start monitoring vegetation health:
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                  <li>Go to <strong>Farmers</strong> section and add your farmers</li>
                  <li>Add land parcels with GPS coordinates for each farmer</li>
                  <li>Request satellite NDVI data for the lands</li>
                  <li>Return here to view real-time vegetation analytics</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}

          {/* Insights Panel */}
          <NDVIInsightsPanel globalStats={globalStats || realtimeStats} />

          {/* Main Analytics Tabs */}
          <Card className="border-muted/50 shadow-xl overflow-hidden">
            <Tabs defaultValue="analytics" className="w-full">
              <div className="border-b bg-muted/20 px-6 pt-4">
                <TabsList className="grid w-full max-w-2xl grid-cols-4 h-auto gap-2 bg-transparent p-0">
                  <TabsTrigger 
                    value="analytics" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-3 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Analytics</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="performance" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-3 shadow-sm"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="hidden sm:inline">Performance</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trends" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-3 shadow-sm"
                  >
                    <LineChart className="w-4 h-4" />
                    <span className="hidden sm:inline">Trends</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="system" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-3 shadow-sm"
                  >
                    <Database className="w-4 h-4" />
                    <span className="hidden sm:inline">System</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="analytics" className="mt-0 space-y-6">
                  <NDVIAnalyticsDashboard 
                    globalStats={realtimeStats || globalStats}
                    ndviData={ndviData}
                  />
                </TabsContent>

                <TabsContent value="performance" className="mt-0 space-y-6">
                  <NDVILandPerformance landData={landData} isLoading={realtimeLoading} />
                </TabsContent>

                <TabsContent value="trends" className="mt-0 space-y-6">
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Historical Trends</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Analyze vegetation health trends over time with advanced predictive analytics
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="system" className="mt-0 space-y-6">
                  <NDVIApiMonitoring />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
