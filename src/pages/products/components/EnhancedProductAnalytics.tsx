import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  ShoppingCart,
  MapPin,
  Search,
  Users,
  Star,
  Package,
  Leaf,
  Bug,
  Droplets,
  Shield,
  Sprout,
  Activity,
  DollarSign,
  AlertTriangle,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useState } from 'react';
import { getChartColors } from '@/utils/chartColors';

export default function EnhancedProductAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [productCategory, setProductCategory] = useState('all');
  
  // Get properly formatted colors for charts
  const chartColors = getChartColors();

  // Product performance data
  const productPerformanceData = [
    { name: 'NPK Fertilizer', sales: 4500, views: 12000, conversion: 37.5 },
    { name: 'Bio Pesticide', sales: 3200, views: 9500, conversion: 33.7 },
    { name: 'Hybrid Seeds', sales: 2800, views: 7200, conversion: 38.9 },
    { name: 'Organic Manure', sales: 2100, views: 6800, conversion: 30.9 },
    { name: 'Drip System', sales: 1800, views: 5200, conversion: 34.6 },
    { name: 'Growth Promoter', sales: 1500, views: 4800, conversion: 31.3 },
  ];

  // Category distribution data
  const categoryData = [
    { name: 'Fertilizers', value: 35, color: chartColors.success },
    { name: 'Pesticides', value: 25, color: chartColors.destructive },
    { name: 'Seeds', value: 20, color: chartColors.warning },
    { name: 'Equipment', value: 15, color: chartColors.primary },
    { name: 'Medicine', value: 5, color: chartColors.accent },
  ];

  // Monthly trend data
  const monthlyTrendData = [
    { month: 'Jan', fertilizers: 2400, pesticides: 1398, seeds: 980, equipment: 780 },
    { month: 'Feb', fertilizers: 1398, pesticides: 2210, seeds: 1200, equipment: 900 },
    { month: 'Mar', fertilizers: 3800, pesticides: 2290, seeds: 1800, equipment: 1100 },
    { month: 'Apr', fertilizers: 4780, pesticides: 2000, seeds: 2100, equipment: 1400 },
    { month: 'May', fertilizers: 5890, pesticides: 2181, seeds: 2500, equipment: 1700 },
    { month: 'Jun', fertilizers: 6390, pesticides: 2500, seeds: 2800, equipment: 2000 },
  ];

  // Stock status data
  const stockStatusData = [
    { status: 'Optimal Stock', count: 145, percentage: 48, color: chartColors.success },
    { status: 'Low Stock', count: 68, percentage: 23, color: chartColors.warning },
    { status: 'Out of Stock', count: 12, percentage: 4, color: chartColors.destructive },
    { status: 'Overstocked', count: 75, percentage: 25, color: chartColors.primary },
  ];

  // Seasonal demand data
  const seasonalDemandData = [
    { season: 'Kharif', fertilizers: 85, pesticides: 75, seeds: 90, equipment: 60 },
    { season: 'Rabi', fertilizers: 70, pesticides: 80, seeds: 85, equipment: 55 },
    { season: 'Zaid', fertilizers: 50, pesticides: 60, seeds: 70, equipment: 45 },
  ];

  // Geographic performance
  const geographicData = [
    { state: 'Maharashtra', revenue: 450000, orders: 1250, growth: 12.5 },
    { state: 'Punjab', revenue: 380000, orders: 980, growth: 8.3 },
    { state: 'Uttar Pradesh', revenue: 320000, orders: 890, growth: 15.2 },
    { state: 'Karnataka', revenue: 280000, orders: 750, growth: 10.8 },
    { state: 'Gujarat', revenue: 240000, orders: 650, growth: 6.5 },
  ];

  const productTypeIcons = {
    fertilizer: { icon: Leaf, color: 'text-green-600 bg-green-50' },
    pesticide: { icon: Bug, color: 'text-red-600 bg-red-50' },
    medicine: { icon: Shield, color: 'text-blue-600 bg-blue-50' },
    seeds: { icon: Sprout, color: 'text-yellow-600 bg-yellow-50' },
    equipment: { icon: Droplets, color: 'text-purple-600 bg-purple-50' },
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BarChart3 className="h-6 w-6" />
                Advanced Product Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive insights into product performance and market trends
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={productCategory} onValueChange={setProductCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fertilizer">Fertilizers</SelectItem>
                  <SelectItem value="pesticide">Pesticides</SelectItem>
                  <SelectItem value="seeds">Seeds</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="medicine">Medicine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Revenue', value: '₹18.5L', change: '+12.5%', icon: DollarSign, trend: 'up' },
          { title: 'Total Products', value: '342', change: '+8', icon: Package, trend: 'up' },
          { title: 'Avg. Order Value', value: '₹2,450', change: '+5.2%', icon: ShoppingCart, trend: 'up' },
          { title: 'Conversion Rate', value: '3.8%', change: '+0.5%', icon: Activity, trend: 'up' },
          { title: 'Stock Alerts', value: '23', change: '-5', icon: AlertTriangle, trend: 'down' },
        ].map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  metric.trend === 'up' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <metric.icon className={`h-5 w-5 ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <Badge variant={metric.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                  {metric.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Product Performance</CardTitle>
                <CardDescription>Sales vs Views with conversion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sales" fill={chartColors.success} name="Sales" />
                    <Bar yAxisId="left" dataKey="views" fill={chartColors.primary} name="Views" />
                    <Line yAxisId="right" type="monotone" dataKey="conversion" stroke={chartColors.warning} name="Conversion %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales Trend</CardTitle>
                <CardDescription>Category-wise sales over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="fertilizers" stackId="1" stroke={chartColors.success} fill={chartColors.success} />
                    <Area type="monotone" dataKey="pesticides" stackId="1" stroke={chartColors.destructive} fill={chartColors.destructive} />
                    <Area type="monotone" dataKey="seeds" stackId="1" stroke={chartColors.warning} fill={chartColors.warning} />
                    <Area type="monotone" dataKey="equipment" stackId="1" stroke={chartColors.primary} fill={chartColors.primary} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Product Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Details</CardTitle>
              <CardDescription>Comprehensive metrics for all products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-right p-2">Sales</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Stock</th>
                      <th className="text-right p-2">Rating</th>
                      <th className="text-right p-2">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Organic NPK 20-20-20', category: 'Fertilizer', sales: 245, revenue: '₹1,10,250', stock: 450, rating: 4.5, trend: 'up' },
                      { name: 'Bio Pesticide Plus', category: 'Pesticide', sales: 189, revenue: '₹85,050', stock: 120, rating: 4.3, trend: 'up' },
                      { name: 'Hybrid Tomato F1', category: 'Seeds', sales: 167, revenue: '₹41,750', stock: 890, rating: 4.7, trend: 'down' },
                      { name: 'Drip Irrigation Kit', category: 'Equipment', sales: 89, revenue: '₹2,67,000', stock: 45, rating: 4.2, trend: 'up' },
                      { name: 'Growth Booster', category: 'Medicine', sales: 134, revenue: '₹53,600', stock: 230, rating: 4.4, trend: 'up' },
                    ].map((product, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{product.name}</td>
                        <td className="p-2">
                          <Badge variant="outline">{product.category}</Badge>
                        </td>
                        <td className="text-right p-2">{product.sales}</td>
                        <td className="text-right p-2 font-medium">{product.revenue}</td>
                        <td className="text-right p-2">
                          <span className={product.stock < 100 ? 'text-orange-600' : ''}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="text-right p-2">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {product.rating}
                          </div>
                        </td>
                        <td className="text-right p-2">
                          {product.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-600 ml-auto" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600 ml-auto" />
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

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Product distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Performance Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Key metrics by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(productTypeIcons).map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{type}s</p>
                            <p className="text-sm text-muted-foreground">
                              {Math.floor(Math.random() * 50 + 20)} products
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{Math.floor(Math.random() * 5 + 1)}L</p>
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            +{Math.floor(Math.random() * 20 + 5)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Demand Analysis</CardTitle>
              <CardDescription>Product demand patterns across agricultural seasons</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={seasonalDemandData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="season" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Fertilizers" dataKey="fertilizers" stroke={chartColors.success} fill={chartColors.success} fillOpacity={0.6} />
                  <Radar name="Pesticides" dataKey="pesticides" stroke={chartColors.destructive} fill={chartColors.destructive} fillOpacity={0.6} />
                  <Radar name="Seeds" dataKey="seeds" stroke={chartColors.warning} fill={chartColors.warning} fillOpacity={0.6} />
                  <Radar name="Equipment" dataKey="equipment" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.6} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Kharif', 'Rabi', 'Zaid'].map((season) => (
              <Card key={season}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {season} Season
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Peak Month</span>
                      <span className="font-medium">
                        {season === 'Kharif' ? 'July' : season === 'Rabi' ? 'October' : 'April'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Top Product</span>
                      <span className="font-medium">
                        {season === 'Kharif' ? 'Seeds' : season === 'Rabi' ? 'Fertilizers' : 'Pesticides'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Order Value</span>
                      <span className="font-medium">
                        ₹{season === 'Kharif' ? '3,200' : season === 'Rabi' ? '2,800' : '1,500'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Performance</CardTitle>
              <CardDescription>State-wise product sales and growth metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geographicData.map((state, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{state.state}</span>
                      </div>
                      <Badge variant={state.growth > 10 ? 'default' : 'secondary'}>
                        +{state.growth}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-medium">₹{(state.revenue / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Orders</p>
                        <p className="font-medium">{state.orders}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg. Order</p>
                        <p className="font-medium">₹{Math.floor(state.revenue / state.orders)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Status Overview</CardTitle>
                <CardDescription>Current inventory health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stockStatusData.map((status, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{status.status}</span>
                        <span className="text-sm text-muted-foreground">
                          {status.count} products ({status.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${status.percentage}%`,
                            backgroundColor: status.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>Products requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'NPK 10-26-26', current: 12, reorder: 50, days: 3 },
                    { name: 'Cypermethrin 25%', current: 8, reorder: 30, days: 2 },
                    { name: 'Tomato Hybrid Seeds', current: 45, reorder: 100, days: 5 },
                    { name: 'Drip Laterals', current: 20, reorder: 80, days: 4 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.current} units left • Reorder at {item.reorder}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        {item.days} days
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}