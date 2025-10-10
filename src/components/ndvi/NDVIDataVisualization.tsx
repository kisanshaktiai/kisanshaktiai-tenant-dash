import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';

interface NDVIDataPoint {
  land_id: string;
  land_name: string;
  ndvi_value: number;
  evi_value?: number;
  date: string;
  farmer_name?: string;
}

interface NDVIDataVisualizationProps {
  data: any[];
}

const NDVI_COLORS = {
  excellent: '#10b981', // > 0.7
  good: '#84cc16',      // 0.5 - 0.7
  moderate: '#eab308',  // 0.3 - 0.5
  poor: '#f97316',      // 0.1 - 0.3
  veryPoor: '#ef4444',  // < 0.1
};

const getNDVIColor = (value: number): string => {
  if (value > 0.7) return NDVI_COLORS.excellent;
  if (value > 0.5) return NDVI_COLORS.good;
  if (value > 0.3) return NDVI_COLORS.moderate;
  if (value > 0.1) return NDVI_COLORS.poor;
  return NDVI_COLORS.veryPoor;
};

const getNDVIStatus = (value: number): { label: string; icon: React.ReactNode } => {
  if (value > 0.7) return { label: 'Excellent', icon: <TrendingUp className="w-4 h-4" /> };
  if (value > 0.5) return { label: 'Good', icon: <TrendingUp className="w-4 h-4" /> };
  if (value > 0.3) return { label: 'Moderate', icon: <Minus className="w-4 h-4" /> };
  if (value > 0.1) return { label: 'Poor', icon: <TrendingDown className="w-4 h-4" /> };
  return { label: 'Very Poor', icon: <TrendingDown className="w-4 h-4" /> };
};

export const NDVIDataVisualization: React.FC<NDVIDataVisualizationProps> = ({ data }) => {
  // Process data for visualizations
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return { timeSeriesData: [], distributionData: [], avgByDate: [] };

    // Time series data
    const timeSeriesData = data.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      ndvi: item.ndvi_value,
      evi: item.evi_value || 0,
      land: item.lands?.name || 'Unknown',
      farmer: item.lands?.farmers?.full_name || 'Unknown'
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // NDVI distribution
    const distributionData = [
      { category: 'Excellent (> 0.7)', count: data.filter(d => d.ndvi_value > 0.7).length, color: NDVI_COLORS.excellent },
      { category: 'Good (0.5-0.7)', count: data.filter(d => d.ndvi_value > 0.5 && d.ndvi_value <= 0.7).length, color: NDVI_COLORS.good },
      { category: 'Moderate (0.3-0.5)', count: data.filter(d => d.ndvi_value > 0.3 && d.ndvi_value <= 0.5).length, color: NDVI_COLORS.moderate },
      { category: 'Poor (0.1-0.3)', count: data.filter(d => d.ndvi_value > 0.1 && d.ndvi_value <= 0.3).length, color: NDVI_COLORS.poor },
      { category: 'Very Poor (< 0.1)', count: data.filter(d => d.ndvi_value <= 0.1).length, color: NDVI_COLORS.veryPoor },
    ];

    // Average by date
    const dateGroups = data.reduce((acc, item) => {
      const date = new Date(item.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { sum: 0, count: 0 };
      }
      acc[date].sum += item.ndvi_value;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    const avgByDate = Object.entries(dateGroups).map(([date, stats]) => ({
      date,
      avgNDVI: (stats as { sum: number; count: number }).sum / (stats as { sum: number; count: number }).count,
      lands: (stats as { sum: number; count: number }).count
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { timeSeriesData, distributionData, avgByDate };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Activity className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
        <p className="text-lg text-muted-foreground">No NDVI data available</p>
        <p className="text-sm text-muted-foreground mt-2">
          Refresh the data or check back later
        </p>
      </Card>
    );
  }

  const avgNDVI = data.reduce((sum, item) => sum + item.ndvi_value, 0) / data.length;
  const maxNDVI = Math.max(...data.map(d => d.ndvi_value));
  const minNDVI = Math.min(...data.map(d => d.ndvi_value));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 hover-scale">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average NDVI</p>
              <p className="text-3xl font-bold mt-2" style={{ color: getNDVIColor(avgNDVI) }}>
                {avgNDVI.toFixed(3)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {getNDVIStatus(avgNDVI).icon}
                <span className="text-sm">{getNDVIStatus(avgNDVI).label}</span>
              </div>
            </div>
            <Activity className="w-12 h-12 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6 hover-scale">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Highest NDVI</p>
              <p className="text-3xl font-bold mt-2" style={{ color: getNDVIColor(maxNDVI) }}>
                {maxNDVI.toFixed(3)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm">Peak Performance</span>
              </div>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 hover-scale">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Lowest NDVI</p>
              <p className="text-3xl font-bold mt-2" style={{ color: getNDVIColor(minNDVI) }}>
                {minNDVI.toFixed(3)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingDown className="w-4 h-4 text-orange-500" />
                <span className="text-sm">Needs Attention</span>
              </div>
            </div>
            <TrendingDown className="w-12 h-12 text-orange-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Visualization Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          {/* Time Series Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              NDVI Trends Over Time
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={processedData.avgByDate}>
                <defs>
                  <linearGradient id="colorNDVI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold">{payload[0].payload.date}</p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Avg NDVI: </span>
                            <span className="font-bold" style={{ color: getNDVIColor(payload[0].value as number) }}>
                              {(payload[0].value as number).toFixed(3)}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">{payload[0].payload.lands} lands</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgNDVI" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorNDVI)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Individual Land Trends */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Individual Land Performance</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={processedData.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ndvi" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                {processedData.timeSeriesData.some(d => d.evi > 0) && (
                  <Line type="monotone" dataKey="evi" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Vegetation Health Distribution
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={processedData.distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-15} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {processedData.distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {processedData.distributionData.map((category, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ backgroundColor: category.color, opacity: 0.2 }} />
                  <p className="text-2xl font-bold">{category.count}</p>
                  <p className="text-xs text-muted-foreground">{category.category}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Land-by-Land Comparison</h3>
            <div className="space-y-4">
              {data.slice(0, 10).map((item, i) => {
                const status = getNDVIStatus(item.ndvi_value);
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.lands?.name || 'Unknown Land'}</span>
                        <Badge style={{ backgroundColor: getNDVIColor(item.ndvi_value) }}>
                          {item.ndvi_value.toFixed(3)}
                        </Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all"
                          style={{ 
                            width: `${item.ndvi_value * 100}%`,
                            backgroundColor: getNDVIColor(item.ndvi_value)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};