import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Leaf, TrendingUp, TrendingDown, Minus, Calendar,
  MapPin, Image, BarChart3, LineChart as LineChartIcon,
  Wifi, RefreshCw, Download, Eye, Layers, Satellite
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import type { 
  NDVIRecord, 
  NDVIFullViewRecord, 
  NDVISummary 
} from '@/hooks/data/useFarmerNDVIRealtime';
import { format } from 'date-fns';

interface ModernNDVIAnalyticsProps {
  ndviRecords: NDVIRecord[];
  fullViewRecords: NDVIFullViewRecord[];
  summary: NDVISummary;
  timeSeries: { date: string; value: number; min: number; max: number; count: number }[];
  isLive?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const getHealthColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    case 'moderate': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    case 'stressed': return 'text-red-400 bg-red-500/20 border-red-500/30';
    default: return 'text-muted-foreground bg-muted';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
    default: return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
};

export const ModernNDVIAnalytics: React.FC<ModernNDVIAnalyticsProps> = ({
  ndviRecords,
  fullViewRecords,
  summary,
  timeSeries,
  isLive = false,
  isLoading = false,
  onRefresh,
}) => {
  const [selectedView, setSelectedView] = useState<'chart' | 'gallery' | 'table'>('chart');
  const [selectedLand, setSelectedLand] = useState<string | null>(null);

  // Group records by land
  const landGroups = fullViewRecords.reduce((acc, record) => {
    if (!acc[record.land_id]) {
      acc[record.land_id] = {
        land_name: record.land_name,
        records: [],
        latest: record,
      };
    }
    acc[record.land_id].records.push(record);
    return acc;
  }, {} as Record<string, { land_name: string; records: NDVIFullViewRecord[]; latest: NDVIFullViewRecord }>);

  if (ndviRecords.length === 0 && fullViewRecords.length === 0) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-blue-500/5">
        <CardContent className="p-8 text-center">
          <Leaf className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No NDVI Data Available</h3>
          <p className="text-sm text-muted-foreground">
            Vegetation index data will appear here once satellite imagery is processed
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current NDVI */}
        <Card className="border-border/50 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Current NDVI</span>
              {getTrendIcon(summary.trend)}
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              {summary.currentNDVI?.toFixed(3) || '--'}
            </p>
            <Badge 
              variant="outline" 
              className={`mt-2 ${getHealthColor(summary.healthStatus)}`}
            >
              {summary.healthStatus.charAt(0).toUpperCase() + summary.healthStatus.slice(1)}
            </Badge>
          </CardContent>
        </Card>

        {/* Average NDVI */}
        <Card className="border-border/50 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">Average</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {summary.avgNDVI?.toFixed(3) || '--'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Range: {summary.minNDVI?.toFixed(2) || '--'} - {summary.maxNDVI?.toFixed(2) || '--'}
            </p>
          </CardContent>
        </Card>

        {/* Records Count */}
        <Card className="border-border/50 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-muted-foreground">Records</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {summary.totalRecords}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.landCoverage} land{summary.landCoverage !== 1 ? 's' : ''} monitored
            </p>
          </CardContent>
        </Card>

        {/* Latest Date */}
        <Card className="border-border/50 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-muted-foreground">Last Update</span>
            </div>
            <p className="text-lg font-bold text-amber-400">
              {summary.latestDate 
                ? format(new Date(summary.latestDate), 'MMM dd, yyyy')
                : '--'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {isLive && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse">
                  <Wifi className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
              {onRefresh && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onRefresh}
                  className="h-6 px-2"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Satellite className="w-5 h-5 text-emerald-400" />
              </div>
              NDVI Time Series Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedView === 'chart' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedView('chart')}
              >
                <LineChartIcon className="w-4 h-4 mr-1" />
                Chart
              </Button>
              <Button
                variant={selectedView === 'gallery' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedView('gallery')}
              >
                <Image className="w-4 h-4 mr-1" />
                Gallery
              </Button>
              <Button
                variant={selectedView === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedView('table')}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Details
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {selectedView === 'chart' && (
              <motion.div
                key="chart"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={timeSeries}>
                    <defs>
                      <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                    />
                    <YAxis 
                      domain={[0, 1]} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(val) => format(new Date(val), 'MMMM dd, yyyy')}
                    />
                    <Legend />
                    <ReferenceLine y={0.5} stroke="hsl(var(--success))" strokeDasharray="3 3" label="Healthy" />
                    <ReferenceLine y={0.3} stroke="hsl(var(--warning))" strokeDasharray="3 3" label="Moderate" />
                    <Area 
                      type="monotone" 
                      dataKey="max" 
                      stroke="hsl(var(--success))"
                      fill="none"
                      strokeDasharray="5 5"
                      name="Max"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))"
                      fill="url(#ndviGradient)"
                      strokeWidth={2}
                      name="Average"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="min" 
                      stroke="hsl(var(--destructive))"
                      fill="none"
                      strokeDasharray="5 5"
                      name="Min"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {selectedView === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {Object.entries(landGroups).map(([landId, group]) => (
                  <Card 
                    key={landId}
                    className={`
                      cursor-pointer transition-all overflow-hidden
                      ${selectedLand === landId ? 'ring-2 ring-primary' : 'hover:border-primary/50'}
                    `}
                    onClick={() => setSelectedLand(landId === selectedLand ? null : landId)}
                  >
                    <div className="relative h-32">
                      {group.latest.image_url || group.latest.ndvi_thumbnail_url ? (
                        <img 
                          src={group.latest.image_url || group.latest.ndvi_thumbnail_url || ''}
                          alt={group.land_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                          <Leaf className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                      <Badge 
                        className="absolute top-2 right-2 bg-background/80 backdrop-blur-md"
                      >
                        {group.latest.ndvi_value?.toFixed(2) || '--'}
                      </Badge>
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium truncate">{group.land_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {group.records.length} records
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}

            {selectedView === 'table' && (
              <motion.div
                key="table"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="overflow-x-auto"
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Land</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">NDVI</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">NDWI</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Coverage</th>
                      <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullViewRecords.slice(0, 20).map((record, idx) => {
                      const status = record.ndvi_value !== null
                        ? record.ndvi_value >= 0.5 ? 'healthy'
                          : record.ndvi_value >= 0.3 ? 'moderate'
                          : 'stressed'
                        : 'unknown';
                      
                      return (
                        <tr 
                          key={record.ndvi_id || idx}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{record.land_name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {format(new Date(record.date), 'MMM dd, yyyy')}
                          </td>
                          <td className="p-3 text-right font-mono font-semibold">
                            {record.ndvi_value?.toFixed(3) || '--'}
                          </td>
                          <td className="p-3 text-right font-mono text-muted-foreground">
                            {record.ndwi_value?.toFixed(3) || '--'}
                          </td>
                          <td className="p-3 text-right text-muted-foreground">
                            {record.coverage !== null ? `${(record.coverage * 100).toFixed(0)}%` : '--'}
                          </td>
                          <td className="p-3 text-center">
                            <Badge 
                              variant="outline"
                              className={getHealthColor(status)}
                            >
                              {status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {fullViewRecords.length > 20 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Showing 20 of {fullViewRecords.length} records
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
