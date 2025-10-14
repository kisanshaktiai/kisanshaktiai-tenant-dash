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
import { useNDVIQueueAutoProcessor } from '@/hooks/data/useNDVIQueueAutoProcessor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageLayout } from '@/components/layout/PageLayout';
import { NDVIOverviewCards } from '@/components/ndvi/NDVIOverviewCards';
import { NDVIInsightsPanel } from '@/components/ndvi/NDVIInsightsPanel';
import { NDVIAnalyticsDashboard } from '@/components/ndvi/NDVIAnalyticsDashboard';
import { NDVILandPerformance } from '@/components/ndvi/NDVILandPerformance';
import { NDVIApiMonitoring } from '@/components/ndvi/NDVIApiMonitoring';
import { NDVIProcessingStatus } from '@/components/ndvi/NDVIProcessingStatus';
import { NDVIDiagnosticsPanel } from '@/components/ndvi/NDVIDiagnosticsPanel';
import { ndviLandService } from '@/services/NDVILandService';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export default function NDVIPage() {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [isCreatingRequests, setIsCreatingRequests] = React.useState(false);
  
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

  // Auto-process queue when new items are added
  useNDVIQueueAutoProcessor();

  // Create NDVI requests and refresh data with comprehensive debug logging
  const handleRefreshAll = async () => {
    if (!currentTenant?.id) {
      console.error('❌ No tenant selected');
      toast.error('No tenant selected');
      return;
    }

    setIsCreatingRequests(true);
    const startTime = Date.now();
    
    try {
      console.log('🔄 [NDVI REFRESH] Starting NDVI workflow for tenant:', currentTenant.id);
      
      // Step 1: Queue NDVI requests for all lands
      console.log('📝 [STEP 1] Queueing NDVI requests...');
      toast.info('Queueing NDVI requests...');
      
      const queueResults = await ndviLandService.fetchNDVIForLands(
        currentTenant.id, 
        undefined, 
        true
      );
      console.log('✅ [STEP 1] Queue results:', {
        totalLands: queueResults?.length || 0,
        successCount: queueResults?.filter(r => r.success).length || 0,
        results: queueResults,
      });
      
      toast.success('Requests queued! Processing...');
      
      // Step 2: Trigger the queue processor to process queued items
      console.log('⚙️ [STEP 2] Triggering queue processor...');
      const { NDVIQueueProcessorService } = await import('@/services/NDVIQueueProcessorService');
      const processResult = await NDVIQueueProcessorService.processQueue(10);
      
      console.log('✅ [STEP 2] Process result:', {
        success: processResult.success,
        processed: processResult.processed,
        failed: processResult.failed,
        message: processResult.message,
      });
      
      if (processResult.success) {
        toast.success(`✅ Processed ${processResult.processed || 0} lands successfully`);
      } else {
        toast.warning(processResult.message || 'Some items failed to process');
      }
      
      // Step 3: Verify data insertion (wait a bit for worker to process)
      console.log('🔍 [STEP 3] Waiting for worker to process data...');
      toast.info('Worker processing... (this may take 1-2 minutes)');
      
      // Give the Render cron job time to pick up and process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🔍 [STEP 3] Verifying NDVI data insertion...');
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: ndviDataCheck, error: ndviError } = await supabase
        .from('ndvi_data')
        .select('id, land_id, date, ndvi_value, created_at')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (ndviError) {
        console.error('❌ [STEP 3] Error checking NDVI data:', ndviError);
      } else {
        console.log('📊 [STEP 3] Recent NDVI data:', ndviDataCheck);
        console.log(`✅ [STEP 3] Found ${ndviDataCheck?.length || 0} recent NDVI records`);
        
        if ((ndviDataCheck?.length || 0) > 0) {
          toast.success(`✅ ${ndviDataCheck?.length} NDVI records found!`);
        } else {
          toast.warning('⚠️ No data yet - worker may still be processing. Check diagnostics panel.');
        }
      }
      
      const { data: microTilesCheck, error: tilesError } = await supabase
        .from('ndvi_micro_tiles')
        .select('id, land_id, acquisition_date, ndvi_mean')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (tilesError) {
        console.error('❌ [STEP 3] Error checking micro tiles:', tilesError);
      } else {
        console.log('🗺️ [STEP 3] Recent micro tiles:', microTilesCheck);
        console.log(`✅ [STEP 3] Found ${microTilesCheck?.length || 0} recent tile records`);
      }
      
      // Step 4: Refresh all data to show updated status
      console.log('🔄 [STEP 4] Refreshing dashboard data...');
      await Promise.all([
        refetchHealth(),
        refetchStats(),
        refetchRealtime(),
      ]);
      console.log('✅ [STEP 4] Dashboard data refreshed');
      
      const duration = Date.now() - startTime;
      console.log(`🎉 [COMPLETE] NDVI refresh completed in ${(duration / 1000).toFixed(2)}s`);
      toast.success('Data refreshed!');
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('❌ [ERROR] NDVI workflow failed:', {
        error: error.message,
        stack: error.stack,
        duration: `${(duration / 1000).toFixed(2)}s`,
      });
      toast.error(error.message || 'Failed to process NDVI requests');
    } finally {
      setIsCreatingRequests(false);
    }
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
                  disabled={isCreatingRequests || !currentTenant?.id}
                  size="lg"
                  className="shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:shadow-primary/25"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isCreatingRequests ? 'animate-spin' : ''}`} />
                  {isCreatingRequests ? 'Creating Requests...' : 'Queue NDVI & Refresh'}
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

          {/* Diagnostics Panel - Shows data verification */}
          <NDVIDiagnosticsPanel />

          {/* Processing Status */}
          <NDVIProcessingStatus />

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
