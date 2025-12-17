import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DealerPerformanceChartProps {
  isLoading?: boolean;
}

// Mock data - in real app, this would come from props
const mockDealerData = [
  { metric: 'Sales Volume', value: 85, fullMark: 100 },
  { metric: 'Customer Satisfaction', value: 92, fullMark: 100 },
  { metric: 'Order Fulfillment', value: 78, fullMark: 100 },
  { metric: 'Response Time', value: 88, fullMark: 100 },
  { metric: 'Product Knowledge', value: 95, fullMark: 100 },
  { metric: 'Return Rate', value: 82, fullMark: 100 },
];

export const DealerPerformanceChart = ({ isLoading }: DealerPerformanceChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dealer Performance Metrics</CardTitle>
        <CardDescription>Multi-dimensional performance analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={mockDealerData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="metric"
              stroke="hsl(var(--foreground))"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            />
            <Radar
              name="Performance"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{payload[0].payload.metric}</span>
                        <span className="text-sm text-muted-foreground">
                          Score: {payload[0].value}/100
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
        
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Top Dealer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ramesh Agri Supplies</div>
              <p className="text-xs text-muted-foreground mt-1">
                ₹2.5M in sales this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Response Time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3 hrs</div>
              <p className="text-xs text-muted-foreground mt-1">
                15% faster than last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Customer Satisfaction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on 1,234 reviews
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
