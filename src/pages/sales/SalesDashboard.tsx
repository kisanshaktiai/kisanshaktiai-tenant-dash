import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrdersQuery } from '@/hooks/data/useOrdersQuery';
import { useSalesAnalyticsQuery } from '@/hooks/data/useSalesAnalyticsQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LayoutGrid,
  List,
  Kanban,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Truck,
  RefreshCw,
} from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersTable } from './components/OrdersTable';
import { OrdersKanban } from './components/OrdersKanban';
import { OrdersCalendar } from './components/OrdersCalendar';
import { OrdersGrid } from './components/OrdersGrid';
import { SalesFilters } from './components/SalesFilters';
import type { OrderFilters } from '@/types/sales';

export default function SalesDashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban' | 'calendar'>('list');
  const [filters, setFilters] = useState<OrderFilters>({});

  const { data: orders, isLoading } = useOrdersQuery(filters);
  const { data: analytics } = useSalesAnalyticsQuery();

  const statsCards = [
    {
      title: 'Total Revenue',
      value: `$${analytics?.total_revenue?.toLocaleString() || '0'}`,
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Active Orders',
      value: analytics?.pending_orders || 0,
      change: '+8.2%',
      trend: 'up' as const,
      icon: ShoppingCart,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Pending Deliveries',
      value: orders?.filter((o) => o.fulfillment_status === 'pending').length || 0,
      change: '-3.1%',
      trend: 'down' as const,
      icon: Truck,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Returns/Refunds',
      value: `${analytics?.return_rate?.toFixed(1) || '0'}%`,
      change: '-2.4%',
      trend: 'down' as const,
      icon: RefreshCw,
      color: 'from-rose-500 to-pink-600',
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Sales Dashboard"
        description="Manage orders, track deliveries, and analyze performance"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/app/sales/predictive')}
              className="bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/20"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Predictive Intelligence
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </div>
        }
      />

      <PageContent>
        {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="relative overflow-hidden backdrop-blur-sm bg-card/50 border-muted/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="flex items-center mt-1 text-sm">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4 text-rose-500" />
                  )}
                  <span
                    className={
                      stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and View Controls */}
      <Card className="backdrop-blur-sm bg-card/50 border-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10"
                  value={filters.search || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </div>
              <SalesFilters filters={filters} onFiltersChange={setFilters} />
            </div>

            <div className="flex gap-2">
              <div className="flex rounded-lg border p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                  className="h-8"
                >
                  <Kanban className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="h-8"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders View */}
      <Card className="backdrop-blur-sm bg-card/50 border-muted/50">
        <CardContent className="p-6">
          {viewMode === 'list' && <OrdersTable orders={orders || []} isLoading={isLoading} />}
          {viewMode === 'grid' && <OrdersGrid orders={orders || []} isLoading={isLoading} />}
          {viewMode === 'kanban' && <OrdersKanban orders={orders || []} isLoading={isLoading} />}
          {viewMode === 'calendar' && (
            <OrdersCalendar orders={orders || []} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>
      </PageContent>
    </PageLayout>
  );
}
