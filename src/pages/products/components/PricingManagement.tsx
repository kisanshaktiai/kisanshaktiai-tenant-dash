import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Target,
  Percent
} from 'lucide-react';

export default function PricingManagement() {
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  const { data: products } = useQuery({
    queryKey: ['products-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price_per_unit, bulk_pricing, dealer_locations, discount_percentage')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Management
          </CardTitle>
          <CardDescription>
            Configure dynamic pricing rules, bulk pricing, and dealer-specific pricing
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="dynamic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dynamic" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dynamic Pricing
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Bulk Pricing
          </TabsTrigger>
          <TabsTrigger value="dealer" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Dealer Pricing
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Seasonal Pricing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dynamic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Pricing Rules</CardTitle>
              <CardDescription>
                Set automated pricing rules based on market conditions, demand, and inventory levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Inventory-Based Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Low Stock (&lt; 10 units)</span>
                      <Badge variant="destructive">+15%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medium Stock (10-50 units)</span>
                      <Badge variant="secondary">Base Price</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Stock (&gt; 50 units)</span>
                      <Badge variant="outline">-5%</Badge>
                    </div>
                  </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Demand-Based Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">High Demand</span>
                        <Badge variant="default">+10%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Normal Demand</span>
                        <Badge variant="secondary">Base Price</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Low Demand</span>
                        <Badge variant="outline">-10%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Competitor Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Above Market</span>
                        <Badge variant="destructive">-5%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">At Market</span>
                        <Badge variant="secondary">Base Price</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Below Market</span>
                        <Badge variant="default">+3%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Pricing Tiers</CardTitle>
              <CardDescription>
                Configure volume-based discounts for different quantity thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Select Product</Label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">Select a product</option>
                      {products?.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedProduct && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quantity Range</TableHead>
                        <TableHead>Base Price</TableHead>
                        <TableHead>Discount %</TableHead>
                        <TableHead>Final Price</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>1 - 9 units</TableCell>
                        <TableCell>₹100.00</TableCell>
                        <TableCell>0%</TableCell>
                        <TableCell>₹100.00</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>10 - 49 units</TableCell>
                        <TableCell>₹100.00</TableCell>
                        <TableCell>5%</TableCell>
                        <TableCell>₹95.00</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>50+ units</TableCell>
                        <TableCell>₹100.00</TableCell>
                        <TableCell>10%</TableCell>
                        <TableCell>₹90.00</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dealer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dealer-Specific Pricing</CardTitle>
              <CardDescription>
                Configure special pricing for different dealer tiers and regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Premium Dealers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Base Discount</span>
                        <Badge variant="default">15%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Volume Bonus</span>
                        <Badge variant="secondary">+5%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Payment Terms</span>
                        <span className="text-sm">30 days</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Configure Rules
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Standard Dealers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Base Discount</span>
                        <Badge variant="secondary">10%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Volume Bonus</span>
                        <Badge variant="outline">+2%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Payment Terms</span>
                        <span className="text-sm">15 days</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Configure Rules
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Pricing</CardTitle>
              <CardDescription>
                Configure time-based pricing for seasonal products and promotions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Season/Period</Label>
                    <select className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
                      <option>Monsoon Season (June - September)</option>
                      <option>Winter Season (October - February)</option>
                      <option>Summer Season (March - May)</option>
                      <option>Festival Period</option>
                      <option>Custom Period</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Price Adjustment</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="0" className="w-20" />
                      <select className="px-3 py-2 border border-input bg-background rounded-md text-sm">
                        <option value="percent">%</option>
                        <option value="fixed">₹</option>
                      </select>
                      <select className="px-3 py-2 border border-input bg-background rounded-md text-sm">
                        <option value="increase">Increase</option>
                        <option value="decrease">Decrease</option>
                      </select>
                    </div>
                  </div>

                  <Button className="w-full">Create Seasonal Rule</Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Active Seasonal Rules</h3>
                  <div className="space-y-3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Monsoon Fertilizer Boost</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Period: June 1 - September 30</p>
                          <p>Adjustment: +15% price increase</p>
                          <p>Products: Fertilizers, Pesticides</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Off-Season Discount</span>
                          <Badge variant="secondary">Scheduled</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Period: November 1 - February 28</p>
                          <p>Adjustment: -10% price decrease</p>
                          <p>Products: Seeds, Tools</p>
                        </div>
                      </CardContent>
                    </Card>
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