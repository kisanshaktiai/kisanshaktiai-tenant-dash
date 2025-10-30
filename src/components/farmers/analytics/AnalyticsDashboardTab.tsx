import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, DollarSign, Target, Activity, 
  Leaf, Droplets, BarChart3, Users, Package 
} from 'lucide-react';
import { NDVITimeSeriesChart } from './NDVITimeSeriesChart';
import { SoilHealthRadarChart } from './SoilHealthRadarChart';
import { EngagementGaugeChart } from './EngagementGaugeChart';
import { cn } from '@/lib/utils';

interface AnalyticsDashboardTabProps {
  farmerData: any;
  ndviData: any[];
  soilData: any;
  engagementScore: number;
}

export const AnalyticsDashboardTab: React.FC<AnalyticsDashboardTabProps> = ({
  farmerData,
  ndviData,
  soilData,
  engagementScore
}) => {
  const kpiData = [
    {
      label: 'Total Revenue',
      value: `₹${((farmerData.total_land_acres || 0) * 25000).toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Crop Health',
      value: `${ndviData.length > 0 ? (ndviData[0].ndvi * 100).toFixed(0) : 0}%`,
      change: '+5.2%',
      trend: 'up',
      icon: Leaf,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Engagement',
      value: `${engagementScore.toFixed(0)}%`,
      change: '-2.1%',
      trend: 'down',
      icon: Activity,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Land Utilization',
      value: `${((farmerData.total_land_acres || 0) * 0.85).toFixed(1)} ac`,
      change: '+8.3%',
      trend: 'up',
      icon: Target,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => (
          <Card key={idx} className="border-border/50 backdrop-blur-sm bg-gradient-to-br from-background to-muted/5 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2 rounded-lg", kpi.bgColor)}>
                  <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs font-semibold",
                    kpi.trend === 'up' ? "text-success border-success/30 bg-success/10" : "text-destructive border-destructive/30 bg-destructive/10"
                  )}
                >
                  {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {kpi.change}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* NDVI Time Series */}
        <div className="col-span-2">
          {ndviData.length > 0 ? (
            <NDVITimeSeriesChart data={ndviData} />
          ) : (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Vegetation Health Time Series</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No NDVI data available</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Engagement Gauge */}
        <div>
          <EngagementGaugeChart score={engagementScore} trend="up" />
        </div>
      </div>

      {/* Soil Health & Activity */}
      <div className="grid grid-cols-3 gap-4">
        {/* Soil Health Radar */}
        <div className="col-span-2">
          {soilData ? (
            <SoilHealthRadarChart soilData={soilData} />
          ) : (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Soil Health Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No soil data available</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Stats */}
        <Card className="border-border/50 bg-gradient-to-br from-background to-muted/5">
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm">Campaigns</span>
              </div>
              <span className="font-bold text-lg">{farmerData.campaign_count || 5}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-success" />
                <span className="text-sm">Products</span>
              </div>
              <span className="font-bold text-lg">{farmerData.product_count || 12}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-warning" />
                <span className="text-sm">Interactions</span>
              </div>
              <span className="font-bold text-lg">{farmerData.total_communications || 28}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-info" />
                <span className="text-sm">Land Parcels</span>
              </div>
              <span className="font-bold text-lg">{farmerData.lands?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
