
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, TrendingUp, Users, Package, Store } from 'lucide-react';
import ExecutiveDashboard from '@/pages/analytics/components/ExecutiveDashboard';
import FarmerAnalytics from '@/pages/analytics/components/FarmerAnalytics';
import ProductPerformance from '@/pages/analytics/components/ProductPerformance';
import ReportBuilder from '@/pages/analytics/components/ReportBuilder';
import PredictiveAnalytics from '@/pages/analytics/components/PredictiveAnalytics';
import DataExport from '@/pages/analytics/components/DataExport';

interface AnalyticsPagePresentationProps {
  data?: any;
  isLoading?: boolean;
  error?: any;
  isLive?: boolean;
  activeChannels?: number;
}

export const AnalyticsPagePresentation: React.FC<AnalyticsPagePresentationProps> = ({
  data,
  isLoading,
  error,
  isLive,
  activeChannels
}) => {
  return (
    <div className="w-full min-h-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg mt-2">
            Comprehensive insights and data-driven decision making
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="gap-1.5">
              <TrendingUp className="h-3 w-3" />
              Real-time Data
            </Badge>
            {isLive && (
              <Badge variant="outline" className="gap-1.5">
                Live • {activeChannels} channels
              </Badge>
            )}
          </div>
        </div>
        <Button className="gap-2 shadow-soft">
          <Download className="h-4 w-4" />
          Export Reports
        </Button>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="executive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
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
