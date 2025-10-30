import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Leaf,
  MapPin,
  Activity,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface NDVIOverviewCardsProps {
  globalStats: any;
  isLoading: boolean;
  isHealthy: boolean;
  realtimeStats?: {
    total_lands: number;
    average_ndvi: number;
    max_ndvi: number;
    coverage_km2: number;
  };
}

export const NDVIOverviewCards: React.FC<NDVIOverviewCardsProps> = ({
  globalStats,
  isLoading,
  isHealthy,
  realtimeStats
}) => {
  // Use real-time stats when available, fallback to API stats or show N/A
  const avgNDVI = realtimeStats?.average_ndvi ?? globalStats?.average_ndvi;
  const maxNDVI = realtimeStats?.max_ndvi ?? globalStats?.max_ndvi;
  const totalLands = realtimeStats?.total_lands ?? globalStats?.total_lands ?? 0;
  const coverage = realtimeStats?.coverage_km2 ?? globalStats?.total_coverage_km2;
  
  const hasData = realtimeStats || globalStats;
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-24 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Average NDVI',
      value: avgNDVI !== undefined && avgNDVI !== null ? avgNDVI.toFixed(3) : hasData ? '0.000' : 'No Data',
      change: !hasData ? 'Awaiting data' : avgNDVI && avgNDVI > 0.6 ? 'Excellent' : avgNDVI && avgNDVI > 0.4 ? 'Good' : 'Monitor',
      trend: hasData ? 'up' : 'neutral',
      icon: Leaf,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-700 dark:text-green-400'
    },
    {
      title: 'Peak Health',
      value: maxNDVI !== undefined && maxNDVI !== null ? maxNDVI.toFixed(3) : hasData ? '0.000' : 'No Data',
      change: !hasData ? 'Awaiting data' : 'Excellent',
      trend: hasData ? 'up' : 'neutral',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-700 dark:text-blue-400'
    },
    {
      title: 'Coverage Area',
      value: coverage !== undefined && coverage !== null
        ? `${coverage.toFixed(2)} km²` 
        : hasData ? '0.00 km²' : 'No Data',
      change: `${totalLands} land${totalLands !== 1 ? 's' : ''}`,
      trend: 'neutral',
      icon: MapPin,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-700 dark:text-purple-400'
    },
    {
      title: 'System Status',
      value: isHealthy ? 'Operational' : 'Offline',
      change: isHealthy ? 'All systems go' : 'Check required',
      trend: isHealthy ? 'up' : 'down',
      icon: isHealthy ? CheckCircle : AlertTriangle,
      color: isHealthy ? 'from-green-500 to-teal-600' : 'from-red-500 to-orange-600',
      bgColor: isHealthy ? 'bg-green-500/10' : 'bg-red-500/10',
      textColor: isHealthy ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className="relative overflow-hidden border-muted/50 hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
            
            <div className="p-6 relative">
              {/* Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} backdrop-blur-sm`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                {stat.trend !== 'neutral' && (
                  <Badge 
                    variant="secondary" 
                    className={`${stat.bgColor} ${stat.textColor} border-0`}
                  >
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {stat.change}
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </div>

              {/* Sparkle Effect on Hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Zap className="w-4 h-4 text-primary/30" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
