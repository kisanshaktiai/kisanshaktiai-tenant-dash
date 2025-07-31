
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  Package, 
  FileText, 
  TrendingUp, 
  Download,
  RefreshCw,
  Settings
} from "lucide-react";
import { ExecutiveDashboard } from "@/pages/analytics/components/ExecutiveDashboard";
import { FarmerAnalytics } from "@/pages/analytics/components/FarmerAnalytics";
import { ProductPerformance } from "@/pages/analytics/components/ProductPerformance";
import { ReportBuilder } from "@/pages/analytics/components/ReportBuilder";
import { PredictiveAnalytics } from "@/pages/analytics/components/PredictiveAnalytics";
import { DataExport } from "@/pages/analytics/components/DataExport";

interface AnalyticsPagePresentationProps {
  activeTab: string;
  isRefreshing: boolean;
  onTabChange: (tab: string) => void;
  onRefresh: () => Promise<void>;
}

export const AnalyticsPagePresentation: React.FC<AnalyticsPagePresentationProps> = ({
  activeTab,
  isRefreshing,
  onTabChange,
  onRefresh,
}) => {
  const tabs = [
    {
      value: "executive",
      label: "Executive Dashboard",
      icon: BarChart3,
      component: ExecutiveDashboard
    },
    {
      value: "farmers",
      label: "Farmer Analytics",
      icon: Users,
      component: FarmerAnalytics
    },
    {
      value: "products",
      label: "Product Performance",
      icon: Package,
      component: ProductPerformance
    },
    {
      value: "reports",
      label: "Report Builder",
      icon: FileText,
      component: ReportBuilder
    },
    {
      value: "predictive",
      label: "Predictive Analytics",
      icon: TrendingUp,
      component: PredictiveAnalytics
    },
    {
      value: "export",
      label: "Data Export",
      icon: Download,
      component: DataExport
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and reporting for data-driven decisions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => {
          const Component = tab.component;
          return (
            <TabsContent key={tab.value} value={tab.value} className="space-y-6">
              <Component />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
