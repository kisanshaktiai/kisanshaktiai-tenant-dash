
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  ShoppingCart, 
  Users, 
  MapPin, 
  Calendar,
  Target,
  Activity,
  Star,
  Search,
  Filter
} from 'lucide-react';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdvancedProductAnalytics() {
  const { getTenantId } = useTenantIsolation();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedProduct, setSelectedProduct] = useState('');

  // Fetch products for selection
  const { data: products } = useQuery({
    queryKey: ['products-analytics', getTenantId()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku')
        .eq('tenant_id', getTenantId())
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Mock data - In real implementation, this would come from analytics tables
  const performanceData = [
    { date: '2024-01', views: 1200, inquiries: 85, conversions: 12 },
    { date: '2024-02', views: 1350, inquiries: 92, conversions: 18 },
    { date: '2024-03', views: 1180, inquiries: 78, conversions: 15 },
    { date: '2024-04', views: 1480, inquiries: 105, conversions: 22 },
    { date: '2024-05', views: 1620, inquiries: 118, conversions: 28 },
    { date: '2024-06', views: 1750, inquiries: 135, conversions: 35 }
  ];

  const topProducts = [
    { name: 'Organic NPK Fertilizer', views: 4500, inquiries: 320, conversion_rate: 7.1 },
    { name: 'Bio Pesticide Spray', views: 3800, inquiries: 285, conversion_rate: 7.5 },
    { name: 'Hybrid Tomato Seeds', views: 3200, inquiries: 245, conversion_rate: 7.7 },
    { name: 'Drip Irrigation Kit', views: 2900, inquiries: 198, conversion_rate: 6.8 },
    { name: 'Soil pH Test Kit', views: 2400, inquiries: 165, conversion_rate: 6.9 }
  ];

  const geographicData = [
    { region: 'Maharashtra', views: 2500, inquiries: 180, value: 35 },
    { region: 'Punjab', views: 2200, inquiries: 165, value: 30 },
    { region: 'Uttar Pradesh', views: 1800, inquiries: 125, value: 25 },
    { region: 'Gujarat', views: 1200, inquiries: 85, value: 15 },
    { region: 'Tamil Nadu', views: 900, inquiries: 62, value: 10 }
  ];

  const searchTerms = [
    { term: 'organic fertilizer', count: 1250, trend: 'up' },
    { term: 'pesticide spray', count: 890, trend: 'up' },
    { term: 'tomato seeds', count: 720, trend: 'down' },
    { term: 'irrigation system', count: 650, trend: 'up' },
    { term: 'soil test', count: 480, trend: 'stable' }
  ];

  const competitorData = [
    { product: 'Organic NPK', our_price: 450, competitor_avg: 475, market_share: 12.5 },
    { product: 'Bio Pesticide', our_price: 320, competitor_avg: 340, market_share: 8.2 },
    { product: 'Hybrid Seeds', our_price: 85, competitor_avg: 90, market_share: 15.3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Product Analytics & Insights
          </CardTitle>
          <CardDescription>
            Comprehensive performance metrics and business intelligence for your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Period:</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Product:</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All products</SelectItem>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="search">Search Terms</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
          <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">8,580</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12.5% vs last month
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Inquiries</p>
                    <p className="text-2xl font-bold">613</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8.2% vs last month
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">7.1%</p>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -0.3% vs last month
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">₹1.2L</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +15.8% vs last month
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Views, inquiries, and conversion trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="inquiries" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="conversions" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performing Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Products with highest engagement and conversion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{product.views.toLocaleString()} views</span>
                          <span>{product.inquiries} inquiries</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={product.conversion_rate > 7 ? 'default' : 'secondary'}>
                      {product.conversion_rate}% conversion
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Analytics</CardTitle>
              <CardDescription>User interaction patterns and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Engagement by Hour</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={[
                      { hour: '00:00', engagement: 20 },
                      { hour: '06:00', engagement: 45 },
                      { hour: '12:00', engagement: 85 },
                      { hour: '18:00', engagement: 120 },
                      { hour: '24:00', engagement: 60 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="engagement" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Engagement by Day</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { day: 'Mon', engagement: 65 },
                      { day: 'Tue', engagement: 85 },
                      { day: 'Wed', engagement: 90 },
                      { day: 'Thu', engagement: 78 },
                      { day: 'Fri', engagement: 95 },
                      { day: 'Sat', engagement: 45 },
                      { day: 'Sun', engagement: 30 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="engagement" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Product interest and demand by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Top Regions by Interest</h3>
                  <div className="space-y-3">
                    {geographicData.map((region, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{region.region}</p>
                            <p className="text-sm text-muted-foreground">
                              {region.views} views • {region.inquiries} inquiries
                            </p>
                          </div>
                        </div>
                        <Badge>{region.value}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Regional Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={geographicData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ region, value }) => `${region}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {geographicData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Term Analysis</CardTitle>
              <CardDescription>Popular search terms and trending keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchTerms.map((term, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{term.term}</p>
                        <p className="text-sm text-muted-foreground">{term.count} searches</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {term.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {term.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                      {term.trend === 'stable' && <Activity className="h-4 w-4 text-gray-600" />}
                      <Badge variant="outline">{term.trend}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Analysis</CardTitle>
              <CardDescription>Compare your products with market competitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitorData.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{item.product}</h3>
                      <Badge>{item.market_share}% market share</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Our Price: </span>
                        <span className="font-medium">₹{item.our_price}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Competitor Avg: </span>
                        <span className="font-medium">₹{item.competitor_avg}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      {item.our_price < item.competitor_avg ? (
                        <p className="text-green-600 text-sm">
                          ✓ Competitive advantage: ₹{item.competitor_avg - item.our_price} below market
                        </p>
                      ) : (
                        <p className="text-red-600 text-sm">
                          ⚠ Price disadvantage: ₹{item.our_price - item.competitor_avg} above market
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights & Recommendations</CardTitle>
              <CardDescription>Smart recommendations to improve product performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900">Optimize Product Descriptions</h3>
                      <p className="text-blue-700 text-sm mt-1">
                        Products with detailed technical specifications get 35% more inquiries. 
                        Consider adding more technical details to your Bio Pesticide Spray.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Apply Recommendation
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-900">Seasonal Pricing Opportunity</h3>
                      <p className="text-green-700 text-sm mt-1">
                        Based on historical data, fertilizer demand increases by 45% in the next 2 weeks. 
                        Consider adjusting pricing for optimal revenue.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        View Pricing Strategy
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-orange-900">Expand to New Markets</h3>
                      <p className="text-orange-700 text-sm mt-1">
                        High search volume detected in Haryana and Karnataka for your top products. 
                        Consider expanding distribution to these regions.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Analyze Market Potential
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
