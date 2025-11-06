import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSalesAnalyticsQuery } from '@/hooks/data/useSalesAnalyticsQuery';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { CalendarIcon, Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueChart } from './components/analytics/RevenueChart';
import { SalesByCategoryChart } from './components/analytics/SalesByCategoryChart';
import { TopProductsChart } from './components/analytics/TopProductsChart';
import { DealerPerformanceChart } from './components/analytics/DealerPerformanceChart';
import { GeographicHeatMap } from './components/analytics/GeographicHeatMap';
import { OrderFunnelChart } from './components/analytics/OrderFunnelChart';

export default function SalesAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: analytics, isLoading, refetch } = useSalesAnalyticsQuery(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd')
  );

  const handlePresetRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  const handleThisMonth = () => {
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    });
  };

  const handleLastMonth = () => {
    const lastMonth = subMonths(new Date(), 1);
    setDateRange({
      from: startOfMonth(lastMonth),
      to: endOfMonth(lastMonth),
    });
  };

  return (
    <PageLayout maxWidth="none">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your sales performance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Presets */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetRange(7)}
              >
                7D
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetRange(30)}
              >
                30D
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleThisMonth}
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLastMonth}
              >
                Last Month
              </Button>
            </div>

            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ₹{analytics?.total_revenue.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {analytics?.total_orders || 0} orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg Order Value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ₹{analytics?.average_order_value.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per transaction
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending Orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analytics?.pending_orders || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Return Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(analytics?.return_rate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Of total orders
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="dealers">Dealers</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <RevenueChart data={analytics?.sales_by_date || []} isLoading={isLoading} />
              <OrderFunnelChart analytics={analytics} isLoading={isLoading} />
            </div>
            <SalesByCategoryChart isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TopProductsChart products={analytics?.top_products || []} isLoading={isLoading} />
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>Detailed product metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.top_products.slice(0, 5).map((product) => (
                      <div key={product.product_id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{product.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity_sold} units sold
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{product.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dealers" className="space-y-4">
            <DealerPerformanceChart isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="geographic" className="space-y-4">
            <GeographicHeatMap isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};
