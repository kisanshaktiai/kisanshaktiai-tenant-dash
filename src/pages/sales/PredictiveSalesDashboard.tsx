import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, Package, AlertTriangle, Phone, Calendar } from 'lucide-react';
import {
  usePredictiveSalesMetrics,
  useTenantDemandForecast,
  useInventoryGap,
  useProactiveSalesOpportunities,
} from '@/hooks/data/usePredictiveSales';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

export const PredictiveSalesDashboard = () => {
  const [timeRange, setTimeRange] = useState<number>(30);

  const { data: metrics, isLoading: metricsLoading } = usePredictiveSalesMetrics(timeRange);
  const { data: demandForecast, isLoading: demandLoading } = useTenantDemandForecast(timeRange);
  const { data: inventoryGap, isLoading: inventoryLoading } = useInventoryGap(timeRange);
  const { data: opportunities, isLoading: opportunitiesLoading } = useProactiveSalesOpportunities(7);

  const chartData = demandForecast?.map((item) => ({
    productType: item.product_type,
    quantity: item.total_quantity,
    farmers: item.farmer_count,
    tasks: item.task_count,
  })) || [];

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Predictive Sales Intelligence</h1>
          <p className="text-muted-foreground">Analyze farmer needs and optimize inventory</p>
        </div>
        <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Next 7 Days</SelectItem>
            <SelectItem value="14">Next 14 Days</SelectItem>
            <SelectItem value="30">Next 30 Days</SelectItem>
            <SelectItem value="60">Next 60 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Farmers with Needs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalFarmersWithNeeds || 0}</div>
            <p className="text-xs text-muted-foreground">in next {timeRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Sales Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(metrics?.totalPredictedValue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">potential revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics?.productsLowStock || 0}
            </div>
            <p className="text-xs text-muted-foreground">need reorder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Contacts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {metrics?.urgentContacts || 0}
            </div>
            <p className="text-xs text-muted-foreground">tasks in next 3 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">Demand Forecast</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Gap</TabsTrigger>
          <TabsTrigger value="opportunities">Sales Opportunities</TabsTrigger>
        </TabsList>

        {/* Demand Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Demand Forecast</CardTitle>
              <CardDescription>Aggregate demand by product type for next {timeRange} days</CardDescription>
            </CardHeader>
            <CardContent>
              {demandLoading ? (
                <div className="h-[300px] flex items-center justify-center">Loading...</div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productType" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="quantity" stroke="hsl(var(--primary))" name="Quantity Needed" />
                    <Line type="monotone" dataKey="farmers" stroke="hsl(var(--accent))" name="Farmers" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No forecast data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demand Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Demand Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product Type</th>
                      <th className="text-right p-2">Total Quantity</th>
                      <th className="text-right p-2">Tasks</th>
                      <th className="text-right p-2">Farmers</th>
                      <th className="text-right p-2">Earliest Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandForecast?.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{item.product_type}</td>
                        <td className="text-right p-2">{item.total_quantity.toFixed(2)}</td>
                        <td className="text-right p-2">{item.task_count}</td>
                        <td className="text-right p-2">{item.farmer_count}</td>
                        <td className="text-right p-2">
                          {item.earliest_date ? format(parseISO(item.earliest_date), 'MMM dd') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Gap Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory vs Demand</CardTitle>
              <CardDescription>Current stock levels compared to predicted demand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product</th>
                      <th className="text-right p-2">Current Stock</th>
                      <th className="text-right p-2">Predicted Demand</th>
                      <th className="text-right p-2">Gap</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-center p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryGap?.map((item) => (
                      <tr key={item.product_id} className="border-b">
                        <td className="p-2 font-medium">{item.product_name}</td>
                        <td className="text-right p-2">{item.current_stock.toFixed(2)}</td>
                        <td className="text-right p-2">{item.predicted_demand.toFixed(2)}</td>
                        <td className={`text-right p-2 font-medium ${item.shortfall < 0 ? 'text-destructive' : 'text-green-600'}`}>
                          {item.shortfall > 0 ? '+' : ''}{item.shortfall.toFixed(2)}
                        </td>
                        <td className="text-center p-2">
                          <span className={`px-2 py-1 rounded text-xs ${getUrgencyColor(item.urgency_level)}`}>
                            {item.urgency_level}
                          </span>
                        </td>
                        <td className="text-center p-2">
                          {item.reorder_needed ? (
                            <Button size="sm" variant="destructive">Reorder</Button>
                          ) : (
                            <Button size="sm" variant="outline">Ready</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities?.map((opp) => (
              <Card key={opp.farmer_id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{opp.farmer_name}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      opp.days_until_task <= 3 ? 'bg-destructive text-destructive-foreground' :
                      opp.days_until_task <= 7 ? 'bg-orange-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {opp.days_until_task}d
                    </span>
                  </CardTitle>
                  <CardDescription>{opp.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{format(parseISO(opp.task_date), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="text-sm font-medium">{opp.task_name}</div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium">Products Needed:</div>
                    {opp.products_needed.map((product, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{product.product_type}</span>
                        <span className={product.in_stock ? 'text-green-600' : 'text-destructive'}>
                          {product.quantity.toFixed(2)} {product.in_stock ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1" variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" className="flex-1">
                      Create Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
