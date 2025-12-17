import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Percent,
  Package,
  Edit,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';

export default function PricingManagement() {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [editingTier, setEditingTier] = useState<any>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products-pricing', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant
  });

  const updatePricingMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', selectedProduct);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Pricing updated successfully');
      queryClient.invalidateQueries({ queryKey: ['products-pricing'] });
    },
    onError: (error) => {
      toast.error('Failed to update pricing');
      console.error(error);
    }
  });

  const selectedProductData = products?.find(p => p.id === selectedProduct);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Product Pricing Management
          </CardTitle>
          <CardDescription>
            Configure dynamic pricing rules, bulk discounts, and dealer-specific pricing for agricultural products
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="product" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="product" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Product Pricing
          </TabsTrigger>
          <TabsTrigger value="dynamic" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dynamic Rules
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Bulk Discounts
          </TabsTrigger>
          <TabsTrigger value="dealer" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Dealer Pricing
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Seasonal Offers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="product" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Base Pricing</CardTitle>
              <CardDescription>
                Set and manage base prices for all agricultural products
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
                          {product.name} - {product.product_type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedProductData && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Current Price</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold">
                            ₹{selectedProductData.price_per_unit || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            per {selectedProductData.unit_type || 'unit'}
                          </div>
                          <Badge variant={selectedProductData.is_organic ? "secondary" : "outline"}>
                            {selectedProductData.is_organic ? 'Organic' : 'Non-Organic'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Stock Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold">
                            {selectedProductData.stock_quantity || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            units available
                          </div>
                          {(selectedProductData.stock_quantity || 0) <= (selectedProductData.reorder_point || 0) && (
                            <Badge variant="destructive">Low Stock</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Price Update</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const newPrice = parseFloat(formData.get('price') as string);
                          if (newPrice > 0) {
                            updatePricingMutation.mutate({ price_per_unit: newPrice });
                          }
                        }}>
                          <div className="space-y-2">
                            <Input
                              type="number"
                              name="price"
                              step="0.01"
                              min="0"
                              placeholder="New price"
                              defaultValue={selectedProductData.price_per_unit || 0}
                              className="w-full"
                              required
                            />
                            <Button 
                              type="submit" 
                              size="sm" 
                              className="w-full"
                              disabled={updatePricingMutation.isPending}
                            >
                              {updatePricingMutation.isPending ? 'Updating...' : 'Update Price'}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dynamic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Pricing Rules</CardTitle>
              <CardDescription>
                Automated pricing adjustments based on inventory, demand, and market conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Inventory-Based Adjustments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Critical Stock (&lt;10%)</span>
                        <Badge variant="destructive">+20%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Low Stock (10-25%)</span>
                        <Badge>+10%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Normal Stock (25-75%)</span>
                        <Badge variant="secondary">Base Price</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Excess Stock (&gt;75%)</span>
                        <Badge variant="outline">-10%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Demand-Based Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Peak Season</span>
                        <Badge>+15%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">High Demand</span>
                        <Badge>+8%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Normal Demand</span>
                        <Badge variant="secondary">Base Price</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Low Demand</span>
                        <Badge variant="outline">-15%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Expiry-Based Discounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Fresh (&gt;6 months)</span>
                        <Badge variant="secondary">Base Price</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">3-6 months</span>
                        <Badge variant="outline">-5%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">1-3 months</span>
                        <Badge>-15%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">&lt;1 month</span>
                        <Badge variant="destructive">-30%</Badge>
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
              <CardTitle>Bulk Purchase Discounts</CardTitle>
              <CardDescription>
                Volume-based pricing tiers for bulk purchases of agricultural products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Select Product Category</Label>
                    <select
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">All Categories</option>
                      <option value="fertilizer">Fertilizers</option>
                      <option value="pesticide">Pesticides</option>
                      <option value="medicine">Medicines</option>
                      <option value="seed">Seeds</option>
                    </select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quantity Range</TableHead>
                      <TableHead>Product Type</TableHead>
                      <TableHead>Discount %</TableHead>
                      <TableHead>Min Order Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>10-49 units</TableCell>
                      <TableCell>All Fertilizers</TableCell>
                      <TableCell>5%</TableCell>
                      <TableCell>₹5,000</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>50-99 units</TableCell>
                      <TableCell>All Fertilizers</TableCell>
                      <TableCell>10%</TableCell>
                      <TableCell>₹20,000</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>100+ units</TableCell>
                      <TableCell>All Fertilizers</TableCell>
                      <TableCell>15%</TableCell>
                      <TableCell>₹50,000</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>25-49 kg</TableCell>
                      <TableCell>Seeds</TableCell>
                      <TableCell>8%</TableCell>
                      <TableCell>₹10,000</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <Button className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bulk Pricing Tier
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dealer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dealer-Specific Pricing</CardTitle>
              <CardDescription>
                Special pricing structures for authorized dealers and distributors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Platinum Dealers</CardTitle>
                    <CardDescription>Top-tier partners with highest volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Base Discount</span>
                        <Badge>18%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Volume Bonus</span>
                        <Badge variant="secondary">+7%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Payment Terms</span>
                        <span className="text-sm">45 days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Min Order</span>
                        <span className="text-sm">₹1,00,000</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        Configure Rules
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Gold Dealers</CardTitle>
                    <CardDescription>Established partners with consistent orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Base Discount</span>
                        <Badge variant="secondary">12%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Volume Bonus</span>
                        <Badge variant="outline">+4%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Payment Terms</span>
                        <span className="text-sm">30 days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Min Order</span>
                        <span className="text-sm">₹50,000</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        Configure Rules
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Silver Dealers</CardTitle>
                    <CardDescription>New partners building their network</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Base Discount</span>
                        <Badge variant="outline">8%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Volume Bonus</span>
                        <Badge variant="outline">+2%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Payment Terms</span>
                        <span className="text-sm">15 days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Min Order</span>
                        <span className="text-sm">₹25,000</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        Configure Rules
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Direct Farmers</CardTitle>
                    <CardDescription>Farmers purchasing directly</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Base Discount</span>
                        <Badge variant="outline">3%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Bulk Discount</span>
                        <Badge variant="outline">+2%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Payment Terms</span>
                        <span className="text-sm">Immediate</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Min Order</span>
                        <span className="text-sm">₹5,000</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
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
              <CardTitle>Seasonal Pricing & Offers</CardTitle>
              <CardDescription>
                Time-based pricing adjustments for agricultural seasons and festivals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Season/Period</Label>
                    <select className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
                      <option>Kharif Season (June - October)</option>
                      <option>Rabi Season (October - March)</option>
                      <option>Zaid Season (April - June)</option>
                      <option>Monsoon Special</option>
                      <option>Harvest Festival</option>
                      <option>Custom Period</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Product Category</Label>
                    <select className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
                      <option>All Products</option>
                      <option>Fertilizers</option>
                      <option>Seeds</option>
                      <option>Pesticides</option>
                      <option>Equipment</option>
                    </select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Season/Event</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Kharif Pre-Season</TableCell>
                      <TableCell>Seeds, Fertilizers</TableCell>
                      <TableCell>
                        <Badge>15% OFF</Badge>
                      </TableCell>
                      <TableCell>May 15 - June 15</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Monsoon Special</TableCell>
                      <TableCell>All Pesticides</TableCell>
                      <TableCell>
                        <Badge>20% OFF</Badge>
                      </TableCell>
                      <TableCell>July 1 - Aug 31</TableCell>
                      <TableCell>
                        <Badge variant="outline">Upcoming</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Harvest Festival</TableCell>
                      <TableCell>All Products</TableCell>
                      <TableCell>
                        <Badge>10% OFF</Badge>
                      </TableCell>
                      <TableCell>Oct 10 - Oct 20</TableCell>
                      <TableCell>
                        <Badge variant="outline">Scheduled</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Year-End Clearance</TableCell>
                      <TableCell>Selected Items</TableCell>
                      <TableCell>
                        <Badge variant="destructive">30% OFF</Badge>
                      </TableCell>
                      <TableCell>Dec 20 - Dec 31</TableCell>
                      <TableCell>
                        <Badge variant="outline">Draft</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="flex gap-2">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Seasonal Offer
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}