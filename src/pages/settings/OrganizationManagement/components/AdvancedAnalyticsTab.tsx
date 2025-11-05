import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrganizationAnalytics } from '@/hooks/organization/useOrganizationAnalytics';
import { useOrganizationExport } from '@/hooks/organization/useOrganizationExport';
import { Users, Store, Package, TrendingUp, RefreshCw, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AIInsightsPanel } from './AIInsightsPanel';
import { AuditTrailViewer } from './AuditTrailViewer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdvancedAnalyticsTab = () => {
  const { analytics, isLoading, refreshAnalytics, isRefreshing } = useOrganizationAnalytics();
  const { exportToJSON, exportToCSV, isExporting } = useOrganizationExport();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const engagementPercentage = analytics?.engagement_rate || 0;
  const activeRatio = analytics
    ? (analytics.active_farmers / Math.max(analytics.total_farmers, 1)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Real-time Analytics</CardTitle>
              <CardDescription>
                Live data from your organization
                {analytics?.calculated_at &&
                  ` • Updated ${new Date(analytics.calculated_at).toLocaleString()}`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshAnalytics()}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isExporting} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => exportToJSON()} className="gap-2">
                    <FileJson className="h-4 w-4" />
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToCSV('farmers')} className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Farmers CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToCSV('dealers')} className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Dealers CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToCSV('products')} className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Products CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Farmers */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
              <div className="flex items-center justify-between mb-3">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{analytics?.total_farmers || 0}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Farmers</span>
                  <span className="text-xs text-green-500">{analytics?.active_farmers || 0} active</span>
                </div>
                <Progress value={activeRatio} className="h-1" />
              </div>
            </div>

            {/* Dealers */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
              <div className="flex items-center justify-between mb-3">
                <Store className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{analytics?.total_dealers || 0}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dealers</span>
                  <span className="text-xs text-green-500">{analytics?.active_dealers || 0} active</span>
                </div>
                <Progress
                  value={(analytics?.active_dealers || 0) / Math.max(analytics?.total_dealers || 1, 1) * 100}
                  className="h-1"
                />
              </div>
            </div>

            {/* Products */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <Package className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold">{analytics?.total_products || 0}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Products</span>
                  <span className="text-xs text-green-500">{analytics?.active_products || 0} active</span>
                </div>
                <Progress
                  value={(analytics?.active_products || 0) / Math.max(analytics?.total_products || 1, 1) * 100}
                  className="h-1"
                />
              </div>
            </div>

            {/* Engagement */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold">{engagementPercentage.toFixed(1)}%</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Engagement Rate</span>
                  <span className="text-xs text-muted-foreground">
                    {analytics?.total_campaigns || 0} campaigns
                  </span>
                </div>
                <Progress value={engagementPercentage} className="h-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <AIInsightsPanel />

      {/* Audit Trail */}
      <AuditTrailViewer />
    </div>
  );
};

export default AdvancedAnalyticsTab;
