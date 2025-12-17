import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { SalesAnalytics } from '@/types/sales';

interface OrderFunnelChartProps {
  analytics?: SalesAnalytics;
  isLoading?: boolean;
}

export const OrderFunnelChart = ({ analytics, isLoading }: OrderFunnelChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalOrders = analytics?.total_orders || 100;
  const deliveredOrders = analytics?.delivered_orders || 0;
  const pendingOrders = analytics?.pending_orders || 0;
  const cancelledOrders = analytics?.cancelled_orders || 0;

  const funnelStages = [
    {
      label: 'Total Orders',
      count: totalOrders,
      percentage: 100,
      color: 'hsl(var(--chart-1))',
    },
    {
      label: 'Pending',
      count: pendingOrders,
      percentage: (pendingOrders / totalOrders) * 100,
      color: 'hsl(var(--chart-2))',
    },
    {
      label: 'Delivered',
      count: deliveredOrders,
      percentage: (deliveredOrders / totalOrders) * 100,
      color: 'hsl(var(--chart-3))',
    },
    {
      label: 'Cancelled',
      count: cancelledOrders,
      percentage: (cancelledOrders / totalOrders) * 100,
      color: 'hsl(var(--chart-4))',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Funnel</CardTitle>
        <CardDescription>Order status distribution and conversion</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelStages.map((stage, index) => (
            <div key={stage.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stage.label}</span>
                <span className="text-muted-foreground">
                  {stage.count} ({stage.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="relative h-12 rounded-lg overflow-hidden bg-muted">
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-500 flex items-center justify-center text-sm font-medium text-white"
                  style={{
                    width: `${stage.percentage}%`,
                    backgroundColor: stage.color,
                    minWidth: stage.count > 0 ? '60px' : '0px',
                  }}
                >
                  {stage.count > 0 && (
                    <span className="mix-blend-difference">
                      {stage.count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Conversion metrics */}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">Success Rate</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Orders successfully delivered
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">Cancellation Rate</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Orders cancelled or rejected
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
