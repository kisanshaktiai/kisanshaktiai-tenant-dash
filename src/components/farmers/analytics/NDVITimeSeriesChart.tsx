import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Leaf } from 'lucide-react';
import { format } from 'date-fns';

interface NDVITimeSeriesChartProps {
  data: Array<{
    capture_date: string;
    ndvi: number;
    evi?: number;
    ndwi?: number;
    savi?: number;
  }>;
}

export const NDVITimeSeriesChart: React.FC<NDVITimeSeriesChartProps> = ({ data }) => {
  const chartData = data.map(d => ({
    date: format(new Date(d.capture_date), 'MMM dd'),
    NDVI: (d.ndvi * 100).toFixed(1),
    EVI: d.evi ? (d.evi * 100).toFixed(1) : null,
    NDWI: d.ndwi ? (d.ndwi * 100).toFixed(1) : null,
    SAVI: d.savi ? (d.savi * 100).toFixed(1) : null,
  }));

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background to-muted/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Leaf className="w-5 h-5 text-success" />
          Vegetation Health Time Series
          <TrendingUp className="w-4 h-4 text-success ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorNDVI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEVI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Legend 
              wrapperStyle={{
                fontSize: '12px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="NDVI" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              fill="url(#colorNDVI)" 
            />
            {chartData.some(d => d.EVI) && (
              <Area 
                type="monotone" 
                dataKey="EVI" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#colorEVI)" 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
