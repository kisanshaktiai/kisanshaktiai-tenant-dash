import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Target,
  AlertCircle,
  Percent,
  BarChart3
} from "lucide-react";

export const ProductPerformance = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const topProducts = [
    { 
      name: "Premium Wheat Seeds", 
      sales: 1247, 
      revenue: "₹3.2L", 
      growth: "+15.2%", 
      margin: 32,
      category: "Seeds"
    },
    { 
      name: "Organic Fertilizer", 
      sales: 892, 
      revenue: "₹2.8L", 
      growth: "+8.7%", 
      margin: 28,
      category: "Fertilizers"
    },
    { 
      name: "Bio Pesticide Spray", 
      sales: 654, 
      revenue: "₹1.9L", 
      growth: "+22.1%", 
      margin: 35,
      category: "Pesticides"
    },
    { 
      name: "Smart Irrigation Kit", 
      sales: 234, 
      revenue: "₹4.1L", 
      growth: "+45.3%", 
      margin: 42,
      category: "Equipment"
    }
  ];

  const marketPenetration = [
    { region: "North India", penetration: 68, potential: "High", products: 245 },
    { region: "West India", penetration: 82, potential: "Medium", products: 198 },
    { region: "South India", penetration: 45, potential: "Very High", products: 167 },
    { region: "East India", penetration: 34, potential: "High", products: 89 },
    { region: "Central India", penetration: 56, potential: "Medium", products: 123 }
  ];

  const seasonalTrends = [
    { season: "Kharif (Jun-Oct)", demand: 85, products: ["Seeds", "Fertilizers"], peak: "July" },
    { season: "Rabi (Nov-Apr)", demand: 92, products: ["Seeds", "Pesticides"], peak: "December" },
    { season: "Zaid (Apr-Jun)", demand: 45, products: ["Equipment", "Irrigation"], peak: "May" },
    { season: "Off-Season", demand: 28, products: ["Storage", "Processing"], peak: "August" }
  ];

  const crossSellOpportunities = [
    { primary: "Premium Seeds", recommended: "Organic Fertilizer", probability: 78, revenue: "₹15K" },
    { primary: "Fertilizers", recommended: "Soil Testing Kit", probability: 65, revenue: "₹8K" },
    { primary: "Pesticides", recommended: "Spraying Equipment", probability: 82, revenue: "₹25K" },
    { primary: "Equipment", recommended: "Maintenance Plans", probability: 54, revenue: "₹12K" }
  ];

  const inventoryMetrics = [
    { product: "Premium Wheat Seeds", stock: 1250, reorder: 500, turnover: 8.2, status: "normal" },
    { product: "Organic Fertilizer", stock: 245, reorder: 400, turnover: 12.1, status: "low" },
    { product: "Bio Pesticide", stock: 890, reorder: 300, turnover: 6.5, status: "normal" },
    { product: "Irrigation Kit", stock: 89, reorder: 150, turnover: 15.3, status: "critical" }
  ];

  const pricingInsights = [
    { product: "Premium Seeds", currentPrice: "₹450", optimalPrice: "₹475", impact: "+5.6% revenue" },
    { product: "Fertilizer Pack", currentPrice: "₹320", optimalPrice: "₹310", impact: "+12% volume" },
    { product: "Pesticide Spray", currentPrice: "₹280", optimalPrice: "₹295", impact: "+3.2% margin" },
    { product: "Tool Kit", currentPrice: "₹1200", optimalPrice: "₹1150", impact: "+8% conversion" }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Performance</h2>
        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="seeds">Seeds</SelectItem>
              <SelectItem value="fertilizers">Fertilizers</SelectItem>
              <SelectItem value="pesticides">Pesticides</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top Products Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
          <CardDescription>Sales performance and revenue by product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.category}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Sales</div>
                    <div className="font-bold">{product.sales}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Revenue</div>
                    <div className="font-bold">{product.revenue}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Growth</div>
                    <Badge variant="default">{product.growth}</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Margin</div>
                    <div className="font-bold">{product.margin}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="market" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="market">Market Penetration</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Trends</TabsTrigger>
          <TabsTrigger value="crosssell">Cross-sell</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Penetration Analysis</CardTitle>
              <CardDescription>Product penetration and potential by region</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketPenetration.map((region) => (
                <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{region.region}</div>
                      <div className="text-sm text-muted-foreground">{region.products} products available</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Penetration</div>
                      <div className="flex items-center space-x-2">
                        <Progress value={region.penetration} className="w-20 h-2" />
                        <span className="font-bold">{region.penetration}%</span>
                      </div>
                    </div>
                    <Badge variant={
                      region.potential === "Very High" ? "default" :
                      region.potential === "High" ? "secondary" : "outline"
                    }>
                      {region.potential} Potential
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Demand Patterns</CardTitle>
              <CardDescription>Product demand trends across agricultural seasons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {seasonalTrends.map((trend) => (
                <div key={trend.season} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{trend.season}</div>
                      <div className="text-sm text-muted-foreground">
                        Peak: {trend.peak} | Products: {trend.products.join(", ")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Demand Index</div>
                      <div className="flex items-center space-x-2">
                        <Progress value={trend.demand} className="w-24 h-3" />
                        <span className="font-bold">{trend.demand}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crosssell" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cross-sell Opportunities</CardTitle>
              <CardDescription>Product recommendation opportunities and potential revenue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {crossSellOpportunities.map((opportunity) => (
                <div key={opportunity.primary} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{opportunity.primary}</div>
                      <div className="text-sm text-muted-foreground">
                        → Recommend: {opportunity.recommended}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                      <Badge variant="default">{opportunity.probability}%</Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Avg Revenue</div>
                      <div className="font-bold">{opportunity.revenue}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Status */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Stock levels and turnover rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {inventoryMetrics.map((item) => (
                  <div key={item.product} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.product}</span>
                      <Badge variant={
                        item.status === "critical" ? "destructive" :
                        item.status === "low" ? "secondary" : "default"
                      }>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Stock:</span>
                        <span className="font-bold ml-1">{item.stock}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reorder:</span>
                        <span className="font-bold ml-1">{item.reorder}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Turnover:</span>
                        <span className="font-bold ml-1">{item.turnover}x</span>
                      </div>
                    </div>
                    <Progress 
                      value={(item.stock / (item.reorder * 2)) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pricing Optimization */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Optimization</CardTitle>
                <CardDescription>Current vs optimal pricing recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pricingInsights.map((insight) => (
                  <div key={insight.product} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{insight.product}</span>
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-bold ml-2">{insight.currentPrice}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Optimal:</span>
                        <span className="font-bold ml-2">{insight.optimalPrice}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.impact}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};