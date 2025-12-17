import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';

interface GeographicHeatMapProps {
  isLoading?: boolean;
}

// Mock geographic data - in real app, this would come from props
const mockRegions = [
  { state: 'Punjab', sales: 1250000, growth: 15, orders: 450, topProduct: 'Wheat Seeds' },
  { state: 'Haryana', sales: 980000, growth: 22, orders: 380, topProduct: 'Fertilizer NPK' },
  { state: 'Uttar Pradesh', sales: 1450000, growth: -5, orders: 620, topProduct: 'Rice Seeds' },
  { state: 'Maharashtra', sales: 1120000, growth: 18, orders: 490, topProduct: 'Cotton Seeds' },
  { state: 'Karnataka', sales: 850000, growth: 12, orders: 320, topProduct: 'Sugarcane Fertilizer' },
  { state: 'Tamil Nadu', sales: 920000, growth: 8, orders: 350, topProduct: 'Paddy Seeds' },
];

export const GeographicHeatMap = ({ isLoading }: GeographicHeatMapProps) => {
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

  const maxSales = Math.max(...mockRegions.map(r => r.sales));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Sales Distribution</CardTitle>
        <CardDescription>Revenue and growth by region</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Visual heat map representation */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {mockRegions.map((region) => {
              const intensity = (region.sales / maxSales) * 100;
              return (
                <div
                  key={region.state}
                  className="relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, 
                      hsl(var(--primary) / ${intensity * 0.15}), 
                      hsl(var(--primary) / ${intensity * 0.05}))`
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">{region.state}</h4>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      region.growth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {region.growth > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{Math.abs(region.growth)}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      ₹{(region.sales / 1000).toFixed(0)}k
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {region.orders} orders
                    </div>
                    <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                      Top: {region.topProduct}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Highest Growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">Haryana</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +22% growth this period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Largest Market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">Uttar Pradesh</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ₹1.45M in total sales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Most Orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">Uttar Pradesh</div>
                <p className="text-xs text-muted-foreground mt-1">
                  620 orders placed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Map placeholder */}
          <div className="mt-6 rounded-lg border bg-muted/20 p-8 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">
              Interactive map visualization would be integrated here
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Using libraries like Leaflet or Mapbox for real-time geographic data
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
