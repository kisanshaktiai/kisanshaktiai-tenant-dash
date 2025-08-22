
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { ExecutiveDashboard } from '@/pages/analytics/components/ExecutiveDashboard';
import { FarmerAnalytics } from '@/pages/analytics/components/FarmerAnalytics';
import { ProductPerformance } from '@/pages/analytics/components/ProductPerformance';
import { ReportBuilder } from '@/pages/analytics/components/ReportBuilder';
import { PredictiveAnalytics } from '@/pages/analytics/components/PredictiveAnalytics';
import { DataExport } from '@/pages/analytics/components/DataExport';
import { BarChart3 } from 'lucide-react';

interface AnalyticsPagePresentationProps {
  data: any;
  isLoading: boolean;
  error: any;
  isLive?: boolean;
  activeChannels?: number;
}

export const AnalyticsPagePresentation: React.FC<AnalyticsPagePresentationProps> = ({
  data,
  isLoading,
  error,
  isLive = false,
  activeChannels = 0
}) => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Analytics & Reports
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights and data-driven analytics for informed decision-making
            </p>
          </div>
          <LiveIndicator isConnected={isLive} activeChannels={activeChannels} />
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="executive" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="executive">Executive</TabsTrigger>
          <TabsTrigger value="farmers">Farmers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="executive">
          <ExecutiveDashboard />
        </TabsContent>

        <TabsContent value="farmers">
          <FarmerAnalytics />
        </TabsContent>

        <TabsContent value="products">
          <ProductPerformance />
        </TabsContent>

        <TabsContent value="reports">
          <ReportBuilder />
        </TabsContent>

        <TabsContent value="predictive">
          <PredictiveAnalytics />
        </TabsContent>

        <TabsContent value="export">
          <DataExport />
        </TabsContent>
      </Tabs>
    </div>
  );
};
