import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Leaf, TreePine, Droplets, Sprout, Download, Calendar, TrendingUp } from 'lucide-react';
import { useNDVITimeSeries } from '@/hooks/data/useNDVIData';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { getChartColors } from '@/utils/chartColors';

interface VegetationTrendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerId: string;
  farmerName: string;
}

export const VegetationTrendsModal: React.FC<VegetationTrendsModalProps> = ({
  isOpen,
  onClose,
  farmerId,
  farmerName
}) => {
  const { data: timeSeries, isLoading } = useNDVITimeSeries(farmerId, 30);
  const colors = getChartColors();

  const downloadData = () => {
    if (!timeSeries) return;
    
    const csv = [
      ['Date', 'NDVI', 'EVI', 'NDWI', 'SAVI'],
      ...timeSeries.map(row => [
        row.date,
        row.ndvi.toFixed(3),
        row.evi.toFixed(3),
        row.ndwi.toFixed(3),
        row.savi.toFixed(3)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vegetation-data-${farmerName}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const chartConfig = {
    ndvi: { color: colors.success, name: 'NDVI', icon: Leaf },
    evi: { color: colors.primary, name: 'EVI', icon: TreePine },
    ndwi: { color: getChartColors().primary, name: 'NDWI', icon: Droplets },
    savi: { color: colors.warning, name: 'SAVI', icon: Sprout }
  };

  const formatXAxis = (tickItem: string) => {
    return format(new Date(tickItem), 'MMM dd');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <DialogTitle>Vegetation Health Trends - {farmerName}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Last 30 Days
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadData}
                disabled={!timeSeries || timeSeries.length === 0}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          ) : timeSeries && timeSeries.length > 0 ? (
            <>
              {/* Main Chart */}
              <Card className="p-4">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All Indices</TabsTrigger>
                    <TabsTrigger value="ndvi">NDVI</TabsTrigger>
                    <TabsTrigger value="evi">EVI</TabsTrigger>
                    <TabsTrigger value="ndwi">NDWI</TabsTrigger>
                    <TabsTrigger value="savi">SAVI</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={timeSeries}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatXAxis}
                          className="text-xs"
                        />
                        <YAxis 
                          domain={[-0.2, 1]}
                          className="text-xs"
                        />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                          formatter={(value: number) => value.toFixed(3)}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="ndvi" 
                          stroke={chartConfig.ndvi.color}
                          name="NDVI"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="evi" 
                          stroke={chartConfig.evi.color}
                          name="EVI"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="ndwi" 
                          stroke={chartConfig.ndwi.color}
                          name="NDWI"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="savi" 
                          stroke={chartConfig.savi.color}
                          name="SAVI"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>

                  {Object.entries(chartConfig).map(([key, config]) => (
                    <TabsContent key={key} value={key} className="mt-4">
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={timeSeries}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={formatXAxis}
                            className="text-xs"
                          />
                          <YAxis 
                            domain={key === 'ndwi' ? [-0.5, 1] : [0, 1]}
                            className="text-xs"
                          />
                          <Tooltip 
                            labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                            formatter={(value: number) => value.toFixed(3)}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey={key} 
                            stroke={config.color}
                            name={config.name}
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </TabsContent>
                  ))}
                </Tabs>
              </Card>

              {/* Statistics Cards */}
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(chartConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  const values = timeSeries.map(d => d[key as keyof typeof d] as number);
                  const latest = values[values.length - 1];
                  const avg = values.reduce((a, b) => a + b, 0) / values.length;
                  const min = Math.min(...values);
                  const max = Math.max(...values);
                  
                  return (
                    <Card key={key} className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm">{config.name}</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Latest:</span>
                          <span className="font-medium">{latest?.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Average:</span>
                          <span className="font-medium">{avg.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Range:</span>
                          <span className="font-medium">{min.toFixed(2)} - {max.toFixed(2)}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Interpretation Guide */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3 text-sm">Index Interpretation Guide</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Leaf className="w-3 h-3 text-green-600" />
                      <span className="font-medium">NDVI (Crop Health)</span>
                    </div>
                    <p className="text-muted-foreground">
                      0.7-1.0: Excellent | 0.5-0.7: Good | 0.3-0.5: Moderate | &lt;0.3: Poor
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TreePine className="w-3 h-3 text-emerald-600" />
                      <span className="font-medium">EVI (Dense Vegetation)</span>
                    </div>
                    <p className="text-muted-foreground">
                      Better for high biomass areas, reduces atmospheric noise
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Droplets className="w-3 h-3 text-blue-600" />
                      <span className="font-medium">NDWI (Water Content)</span>
                    </div>
                    <p className="text-muted-foreground">
                      &gt;0.3: Well hydrated | 0-0.3: Moderate | &lt;0: Water stress
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sprout className="w-3 h-3 text-amber-600" />
                      <span className="font-medium">SAVI (Soil Adjusted)</span>
                    </div>
                    <p className="text-muted-foreground">
                      Best for sparse vegetation and early growth stages
                    </p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No vegetation data available for the last 30 days</p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};