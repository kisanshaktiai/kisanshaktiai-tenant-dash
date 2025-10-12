import React, { useState } from 'react';
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
import { SoilAnalyticsDashboard } from '@/components/soil/SoilAnalyticsDashboard';
import { LandWithSoil } from '@/services/SoilAnalysisService';
import { RefreshCw, AlertCircle, Activity, BarChart3, Table2, Loader2 } from 'lucide-react';
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

    batchUpdateSoilData(
      {
        landIds,
        tenantId,
        onProgress: (current, total) => {
          setBatchProgress({ current, total });
        },
      },
      {
        onSettled: () => {
          setBatchProgress(null);
          refetchLands();
        },
      }
    );
  };

  const progressPercentage = batchProgress
    ? Math.round((batchProgress.current / batchProgress.total) * 100)
    : 0;

  return (
    <PageLayout>
      {/* Header */}
      <PageHeader
        title="Soil Analysis & Insights"
        description="AI-powered soil health intelligence for every farmer"
        badge={{ text: 'Beta', variant: 'secondary' }}
        actions={
          <div className="flex items-center gap-3">
            {/* API Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
              {isApiConnected ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    🟢 Connected
                  </span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    🔴 Offline
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
          <AlertTitle>Soil service temporarily unavailable</AlertTitle>
          <AlertDescription>
            Unable to connect to the soil analysis API. Please try again later or contact support if the issue persists.
            {healthStatus?.message && <div className="mt-2 text-sm">Details: {healthStatus.message}</div>}
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lands</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{landsWithSoil?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Tracked lands</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Soil Data</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {landsWithSoil?.filter((land) => land.soil_health && land.soil_health.length > 0).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {landsWithSoil?.length
                ? Math.round(
                    ((landsWithSoil.filter((land) => land.soil_health && land.soil_health.length > 0).length || 0) /
                      landsWithSoil.length) *
                      100
                  )
                : 0}
              % coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg pH Level</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {landsWithSoil && landsWithSoil.length > 0
                ? (
                    landsWithSoil.reduce((sum, land) => {
                      const pH = land.soil_health?.[0]?.ph_level ?? land.soil_ph ?? 0;
                      return sum + pH;
                    }, 0) / landsWithSoil.filter(land => land.soil_health?.[0]?.ph_level || land.soil_ph).length
                  ).toFixed(2)
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Across all lands</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Organic Carbon</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {landsWithSoil && landsWithSoil.length > 0
                ? (
                    landsWithSoil.reduce((sum, land) => {
                      const oc = land.soil_health?.[0]?.organic_carbon ?? land.organic_carbon_percent ?? 0;
                      return sum + oc;
                    }, 0) / landsWithSoil.filter(land => land.soil_health?.[0]?.organic_carbon || land.organic_carbon_percent).length
                  ).toFixed(2)
                : 'N/A'}
              %
            </div>
            <p className="text-xs text-muted-foreground">Across all lands</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="overview" className="gap-2">
            <Table2 className="h-4 w-4" />
            Land Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {isLoadingLands ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : !landsWithSoil || landsWithSoil.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-3">
                  <p className="text-lg text-muted-foreground">No lands found</p>
                  <p className="text-sm text-muted-foreground">
                    Add lands in the Farmers section to start tracking soil health.
                  </p>
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
                <div className="text-center space-y-3">
                  <p className="text-lg text-muted-foreground">No data available</p>
                  <p className="text-sm text-muted-foreground">
                    Add soil data to see analytics and trends.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <SoilAnalyticsDashboard lands={landsWithSoil} />
          )}
        </TabsContent>
      </Tabs>

      {/* Soil Detail Drawer */}
      <SoilDetailDrawer land={selectedLand} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </PageLayout>
  );
}
