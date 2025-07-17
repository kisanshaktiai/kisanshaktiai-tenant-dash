import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  ShoppingCart,
  MapPin,
  Search,
  Users,
  Star
} from 'lucide-react';

export default function ProductAnalytics() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Product Analytics
          </CardTitle>
          <CardDescription>
            Track product performance, demand patterns, and optimization opportunities
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">12,450</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+12.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">3.2%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+0.8%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.3</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+0.2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">847</p>
                <p className="text-sm text-muted-foreground">Inquiries</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+23%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Products with highest engagement and conversion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Organic NPK Fertilizer', views: 2450, conversion: 4.2, trend: '+15%' },
                { name: 'Premium Pesticide Spray', views: 1890, conversion: 3.8, trend: '+8%' },
                { name: 'Hybrid Tomato Seeds', views: 1650, conversion: 5.1, trend: '+22%' },
                { name: 'Drip Irrigation Kit', views: 1420, conversion: 2.9, trend: '+5%' },
                { name: 'Bio Fungicide Solution', views: 1200, conversion: 3.5, trend: '+12%' }
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.views} views • {product.conversion}% conversion
                    </div>
                  </div>
                  <Badge variant="secondary">{product.trend}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Demand */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Demand
            </CardTitle>
            <CardDescription>Product demand by region and state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { region: 'Maharashtra', demand: 'High', growth: '+18%', products: 'Fertilizers, Seeds' },
                { region: 'Punjab', demand: 'High', growth: '+12%', products: 'Pesticides, Tools' },
                { region: 'Uttar Pradesh', demand: 'Medium', growth: '+8%', products: 'Organic Products' },
                { region: 'Karnataka', demand: 'Medium', growth: '+15%', products: 'Irrigation, Seeds' },
                { region: 'Gujarat', demand: 'Low', growth: '+5%', products: 'Fertilizers' }
              ].map((region, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{region.region}</span>
                    <Badge variant={
                      region.demand === 'High' ? 'default' : 
                      region.demand === 'Medium' ? 'secondary' : 'outline'
                    }>
                      {region.demand}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Growth: {region.growth}</span>
                      <span>{region.products}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Analytics
            </CardTitle>
            <CardDescription>Most searched terms and products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { term: 'organic fertilizer', searches: 1250, results: 45 },
                { term: 'tomato seeds', searches: 980, results: 32 },
                { term: 'pest control', searches: 750, results: 28 },
                { term: 'drip irrigation', searches: 620, results: 15 },
                { term: 'bio pesticide', searches: 480, results: 22 }
              ].map((search, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded">
                  <div>
                    <div className="font-medium">{search.term}</div>
                    <div className="text-sm text-muted-foreground">
                      {search.searches} searches • {search.results} results
                    </div>
                  </div>
                  <div className="w-20 h-2 bg-muted rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${(search.searches / 1250) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendation Effectiveness */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendation Effectiveness</CardTitle>
            <CardDescription>Performance of product recommendation algorithms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Cross-sell Recommendations</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Click Rate: 12.5%</span>
                    <span>Conversion: 3.8%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Similar Products</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Click Rate: 8.2%</span>
                    <span>Conversion: 2.1%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Seasonal Recommendations</span>
                  <Badge variant="outline">Testing</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Click Rate: 15.8%</span>
                    <span>Conversion: 4.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}