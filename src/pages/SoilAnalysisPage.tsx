import React, { useState, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSoilAnalysis } from '@/hooks/data/useSoilAnalysis';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { SoilOverviewTable } from '@/components/soil/SoilOverviewTable';
import { SoilDetailDrawer } from '@/components/soil/SoilDetailDrawer';
import { EnhancedSoilAnalytics } from '@/components/soil/EnhancedSoilAnalytics';
import { SoilDistributionInsights } from '@/components/soil/SoilDistributionInsights';
import { LandWithSoil } from '@/services/SoilAnalysisService';
import { Leaf, RefreshCw, AlertCircle, Activity, BarChart3, Table2, Loader2, Users, MapPin, TrendingUp, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function SoilAnalysisPage() {
  const { getTenantId } = useTenantIsolation();
  const [selectedLand, setSelectedLand] = useState<LandWithSoil | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const {
    healthStatus,
    isApiConnected,
    landsWithSoil,
    isLoadingLands,
    updateSoilData,
    isUpdatingSoilData,
    batchUpdateSoilData,
    isBatchUpdating,
    refetchLands,
  } = useSoilAnalysis();

  // Calculate enhanced statistics
  const stats = useMemo(() => {
    if (!landsWithSoil || landsWithSoil.length === 0) {
      return {
        totalLands: 0,
        totalFarmers: 0,
        totalArea: 0,
        avgN: 0,
        avgP: 0,
        avgK: 0,
        landsWithData: 0,
        dataCompleteness: 0,
      };
    }

    const uniqueFarmers = new Set(landsWithSoil.map(l => l.farmer_id)).size;
    const totalArea = landsWithSoil.reduce((sum, land) => sum + land.area_acres, 0);
    const landsWithSoilData = landsWithSoil.filter(l => l.soil_health && l.soil_health.length > 0);

    const npkValues = landsWithSoilData.reduce(
      (acc, land) => {
        const latestSoil = land.soil_health?.[0];
        if (latestSoil?.nitrogen_kg_per_ha) acc.n.push(latestSoil.nitrogen_kg_per_ha);
        if (latestSoil?.phosphorus_kg_per_ha) acc.p.push(latestSoil.phosphorus_kg_per_ha);
        if (latestSoil?.potassium_kg_per_ha) acc.k.push(latestSoil.potassium_kg_per_ha);
        return acc;
      },
      { n: [] as number[], p: [] as number[], k: [] as number[] }
    );

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      totalLands: landsWithSoil.length,
      totalFarmers: uniqueFarmers,
      totalArea: totalArea,
      avgN: avg(npkValues.n),
      avgP: avg(npkValues.p),
      avgK: avg(npkValues.k),
      landsWithData: landsWithSoilData.length,
      dataCompleteness: landsWithSoil.length > 0 ? (landsWithSoilData.length / landsWithSoil.length) * 100 : 0,
    };
  }, [landsWithSoil]);

  const handleLandClick = (land: LandWithSoil) => {
    setSelectedLand(land);
    setIsDrawerOpen(true);
  };

  const handleUpdateSoilData = (landId: string, tenantId: string) => {
    updateSoilData({ landId, tenantId });
  };

  const handleRefreshAll = async () => {
    if (!landsWithSoil || landsWithSoil.length === 0) {
      toast.error('No lands available to update');
      return;
    }

    const landIds = landsWithSoil.map((land) => land.id);
    const tenantId = getTenantId();

    toast.info(`Starting batch update for ${landIds.length} lands...`);
    setBatchProgress({ current: 0, total: landIds.length });

    batchUpdateSoilData({ landIds, tenantId });
  };

  const progressPercentage = batchProgress
    ? Math.round((batchProgress.current / batchProgress.total) * 100)
    : 0;

  return (
    <PageLayout>
      {/* Header */}
      <PageHeader
        title="Soil Health Intelligence"
        description="Comprehensive soil analysis with AI-powered insights for precision farming"
        badge={{ text: 'Multi-Tenant', variant: 'secondary' }}
        actions={
          <div className="flex items-center gap-3">
            {/* API Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
              {isApiConnected ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Connected
                  </span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    Offline
                  </span>
                </>
              )}
            </div>

            {/* Refresh All Button */}
            <Button
              onClick={handleRefreshAll}
              disabled={isBatchUpdating || !isApiConnected || !landsWithSoil || landsWithSoil.length === 0}
              className="gap-2"
            >
              {isBatchUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh All Soil Data
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Offline Alert */}
      {!isApiConnected && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Soil Analysis Service Unavailable</AlertTitle>
          <AlertDescription>
            Unable to connect to the soil analysis API. The service may be temporarily down. Please try again later or contact support if the issue persists.
            {healthStatus?.message && <div className="mt-2 text-sm font-mono">Error: {healthStatus.message}</div>}
          </AlertDescription>
        </Alert>
      )}

      {/* Batch Progress Bar */}
      {batchProgress && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Processing: {batchProgress.current} of {batchProgress.total} lands
                </span>
                <span className="text-muted-foreground">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lands</CardTitle>
            <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLands}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalArea.toFixed(1)} acres • {stats.dataCompleteness.toFixed(0)}% with data
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Farmers</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFarmers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.landsWithData} lands analyzed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Nitrogen</CardTitle>
            <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgN > 0 ? stats.avgN.toFixed(1) : 'N/A'}</div>
            <p className="text-xs text-muted-foreground">kg/ha • Target: &gt;280</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Phosphorus</CardTitle>
            <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgP > 0 ? stats.avgP.toFixed(1) : 'N/A'}</div>
            <p className="text-xs text-muted-foreground">kg/ha • Target: &gt;22</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Potassium</CardTitle>
            <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgK > 0 ? stats.avgK.toFixed(1) : 'N/A'}</div>
            <p className="text-xs text-muted-foreground">kg/ha • Target: &gt;110</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Market Insights
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2">
            <Table2 className="h-4 w-4" />
            Land Data
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {isLoadingLands ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading land data...</p>
              </CardContent>
            </Card>
          ) : !landsWithSoil || landsWithSoil.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-4">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">No Lands Found</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Add lands in the Farmers section to start tracking soil health and get AI-powered insights.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <SoilOverviewTable
              lands={landsWithSoil}
              onLandClick={handleLandClick}
              onUpdateSoilData={handleUpdateSoilData}
              isUpdating={isUpdatingSoilData}
            />
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {!landsWithSoil || landsWithSoil.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-4">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">No Analytics Available</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Add soil data to see comprehensive analytics, trends, and actionable insights.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <EnhancedSoilAnalytics lands={landsWithSoil} />
          )}
        </TabsContent>

        {/* Market Insights Tab */}
        <TabsContent value="insights">
          {!landsWithSoil || landsWithSoil.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-4">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">No Market Insights Available</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Add soil data to see product distribution recommendations and market opportunities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Product Distribution Strategy
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI-powered recommendations for fertilizer distribution based on regional soil health analysis
                </p>
              </CardHeader>
              <CardContent>
                <SoilDistributionInsights lands={landsWithSoil} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Soil Detail Drawer */}
      <SoilDetailDrawer 
        land={selectedLand} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </PageLayout>
  );
}
