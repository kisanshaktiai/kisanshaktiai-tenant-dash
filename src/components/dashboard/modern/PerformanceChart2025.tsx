import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getChartColors } from '@/utils/chartColors';

interface PerformanceChart2025Props {
  data?: any[];
  title?: string;
}

export const PerformanceChart2025: React.FC<PerformanceChart2025Props> = ({
  data,
  title = 'Performance Trends',
}) => {
  const colors = getChartColors();

  // Default data if none provided
  const chartData = data || [
    { month: 'Jan', farmers: 400, products: 240, dealers: 100 },
    { month: 'Feb', farmers: 500, products: 300, dealers: 120 },
    { month: 'Mar', farmers: 650, products: 380, dealers: 150 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorFarmers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.success} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.success} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDealers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.accent} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="farmers"
              stroke={colors.primary}
              fillOpacity={1}
              fill="url(#colorFarmers)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="products"
              stroke={colors.success}
              fillOpacity={1}
              fill="url(#colorProducts)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="dealers"
              stroke={colors.accent}
              fillOpacity={1}
              fill="url(#colorDealers)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
