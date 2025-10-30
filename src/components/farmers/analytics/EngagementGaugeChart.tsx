import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EngagementGaugeChartProps {
  score: number;
  trend?: 'up' | 'down' | 'stable';
  label?: string;
}

export const EngagementGaugeChart: React.FC<EngagementGaugeChartProps> = ({ 
  score, 
  trend = 'stable',
  label = 'Engagement Score'
}) => {
  const getColor = () => {
    if (score >= 80) return 'hsl(var(--success))';
    if (score >= 60) return 'hsl(var(--primary))';
    if (score >= 40) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getColorClass = () => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const data = [
    {
      name: label,
      value: score,
      fill: getColor()
    }
  ];

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background to-muted/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="w-5 h-5 text-primary" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="60%" 
            outerRadius="90%" 
            data={data} 
            startAngle={180} 
            endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar 
              background={{ fill: 'hsl(var(--muted))' }}
              dataKey="value" 
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="text-center -mt-4">
          <div className={cn("text-4xl font-bold", getColorClass())}>
            {score.toFixed(0)}%
          </div>
          <div className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
            <span>{trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
