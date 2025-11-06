import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { getChartColor } from '@/utils/chartColors';
import { TrendingUp, Package, DollarSign, Activity } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CategoryStats {
  category_id: string;
  category_name: string;
  product_count: number;
  total_stock: number;
  avg_price: number;
  active_products: number;
}

export default function CategoryAnalytics() {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const { data: categoryStats, isLoading } = useQuery({
    queryKey: ['category-analytics', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant) throw new Error('No tenant selected');

      // Get category stats
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('category_id, price_per_unit, stock_quantity, is_active')
        .eq('tenant_id', currentTenant.id);

      if (productsError) throw productsError;

      const { data: categories, error: categoriesError } = await supabase
        .from('product_categories')
        .select('id, name');

      if (categoriesError) throw categoriesError;

      // Calculate stats per category
      const statsMap = new Map<string, CategoryStats>();

      categories?.forEach((cat) => {
        statsMap.set(cat.id, {
          category_id: cat.id,
          category_name: cat.name,
          product_count: 0,
          total_stock: 0,
          avg_price: 0,
          active_products: 0,
        });
      });

      products?.forEach((product) => {
        const stats = statsMap.get(product.category_id);
        if (stats) {
          stats.product_count++;
          stats.total_stock += product.stock_quantity || 0;
          stats.avg_price += product.price_per_unit || 0;
          if (product.is_active) stats.active_products++;
        }
      });

      // Calculate averages
      statsMap.forEach((stats) => {
        if (stats.product_count > 0) {
          stats.avg_price = stats.avg_price / stats.product_count;
        }
      });

      return Array.from(statsMap.values()).filter((s) => s.product_count > 0);
    },
    enabled: !!currentTenant,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalProducts = categoryStats?.reduce((sum, s) => sum + s.product_count, 0) || 0;
  const totalStock = categoryStats?.reduce((sum, s) => sum + s.total_stock, 0) || 0;
  const avgCategoryProducts = totalProducts / (categoryStats?.length || 1);
  const topCategory = categoryStats?.[0] || null;

  // Prepare chart data
  const topCategories = (categoryStats || []).slice(0, 8).sort((a, b) => b.product_count - a.product_count);

  const productCountChartData = {
    labels: topCategories.map((s) => s.category_name),
    datasets: [
      {
        label: 'Products',
        data: topCategories.map((s) => s.product_count),
        backgroundColor: getChartColor('--primary', 0.6),
        borderColor: getChartColor('--primary'),
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Active Products',
        data: topCategories.map((s) => s.active_products),
        backgroundColor: getChartColor('--success', 0.6),
        borderColor: getChartColor('--success'),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const stockChartData = {
    labels: topCategories.map((s) => s.category_name),
    datasets: [
      {
        label: 'Total Stock',
        data: topCategories.map((s) => s.total_stock),
        backgroundColor: getChartColor('--accent', 0.6),
        borderColor: getChartColor('--accent'),
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const priceChartData = {
    labels: topCategories.map((s) => s.category_name),
    datasets: [
      {
        label: 'Avg Price',
        data: topCategories.map((s) => s.avg_price),
        backgroundColor: getChartColor('--warning', 0.6),
        borderColor: getChartColor('--warning'),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: getChartColor('--foreground'),
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: getChartColor('--popover'),
        titleColor: getChartColor('--popover-foreground'),
        bodyColor: getChartColor('--popover-foreground'),
        borderColor: getChartColor('--border'),
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: getChartColor('--muted-foreground') },
        grid: { color: getChartColor('--border', 0.1) },
      },
      y: {
        ticks: { color: getChartColor('--muted-foreground') },
        grid: { color: getChartColor('--border', 0.1) },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {categoryStats?.length || 0} categories
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 hover:border-accent/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Activity className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Units in inventory
            </p>
          </CardContent>
        </Card>

        <Card className="border-success/20 hover:border-success/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Category</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{avgCategoryProducts.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Products per category
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning/20 hover:border-warning/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <DollarSign className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{topCategory?.category_name || 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {topCategory?.product_count || 0} products
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Product Distribution
            </CardTitle>
            <CardDescription>
              Total and active products per category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={productCountChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Stock Levels
            </CardTitle>
            <CardDescription>
              Inventory distribution across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line data={stockChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-warning" />
              Average Pricing
            </CardTitle>
            <CardDescription>
              Average product price by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={priceChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance Details</CardTitle>
          <CardDescription>
            Detailed breakdown of products, stock, and pricing per category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Products</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Active</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats?.map((stat) => (
                  <tr key={stat.category_id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{stat.category_name}</td>
                    <td className="text-right py-3 px-4">{stat.product_count}</td>
                    <td className="text-right py-3 px-4 text-success">{stat.active_products}</td>
                    <td className="text-right py-3 px-4">{stat.total_stock.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">₹{stat.avg_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
