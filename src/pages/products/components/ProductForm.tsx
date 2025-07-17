import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Plus,
  Package,
  DollarSign,
  Globe,
  Shield,
  BarChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  brand: z.string().min(1, 'Brand is required'),
  category_id: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  price_per_unit: z.number().min(0, 'Price must be positive'),
  unit_type: z.string().min(1, 'Unit type is required'),
  min_order_quantity: z.number().min(1, 'Minimum order quantity must be at least 1'),
  max_order_quantity: z.number().optional(),
  stock_quantity: z.number().min(0, 'Stock quantity must be non-negative'),
  availability_status: z.string(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  discount_percentage: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  specifications: z.record(z.string()).optional(),
  bulk_pricing: z.array(z.object({
    quantity: z.number(),
    price: z.number(),
    discount: z.number()
  })).optional(),
  dealer_locations: z.array(z.object({
    dealer_id: z.string(),
    region: z.string(),
    price_modifier: z.number()
  })).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ productId, onCancel, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [bulkPricingTiers, setBulkPricingTiers] = useState<Array<{quantity: number, price: number, discount: number}>>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_active: true,
      is_featured: false,
      min_order_quantity: 1,
      availability_status: 'in_stock',
      tags: [],
      specifications: {},
      bulk_pricing: [],
      dealer_locations: []
    },
  });

  // Fetch product data if editing
  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // Load product data into form
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku || '',
        brand: product.brand || '',
        category_id: product.category_id || '',
        description: product.description || '',
        price_per_unit: product.price_per_unit || 0,
        unit_type: product.unit_type || '',
        min_order_quantity: product.min_order_quantity || 1,
        max_order_quantity: product.max_order_quantity || undefined,
        stock_quantity: product.stock_quantity || 0,
        availability_status: product.availability_status || 'in_stock',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        discount_percentage: product.discount_percentage || undefined,
        tags: product.tags || [],
        specifications: (product.specifications as Record<string, string>) || {},
        bulk_pricing: (product.bulk_pricing as Array<{quantity: number, price: number, discount: number}>) || [],
        dealer_locations: (product.dealer_locations as Array<{dealer_id: string, region: string, price_modifier: number}>) || [],
      });
      setImages(product.images || []);
      setBulkPricingTiers((product.bulk_pricing as Array<{quantity: number, price: number, discount: number}>) || []);
    }
  }, [product, form]);

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const insertData = {
        name: data.name,
        sku: data.sku,
        brand: data.brand,
        category_id: data.category_id,
        description: data.description,
        price_per_unit: data.price_per_unit,
        unit_type: data.unit_type,
        min_order_quantity: data.min_order_quantity,
        max_order_quantity: data.max_order_quantity,
        stock_quantity: data.stock_quantity,
        availability_status: data.availability_status,
        is_active: data.is_active,
        is_featured: data.is_featured,
        discount_percentage: data.discount_percentage,
        tags: data.tags,
        specifications: data.specifications as any,
        bulk_pricing: bulkPricingTiers as any,
        dealer_locations: data.dealer_locations as any,
        images,
        tenant_id: '00000000-0000-0000-0000-000000000000' // TODO: Get from auth context
      };
      const { error } = await supabase
        .from('products')
        .insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Product created successfully' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: 'Error creating product', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const updateData = {
        name: data.name,
        sku: data.sku,
        brand: data.brand,
        category_id: data.category_id,
        description: data.description,
        price_per_unit: data.price_per_unit,
        unit_type: data.unit_type,
        min_order_quantity: data.min_order_quantity,
        max_order_quantity: data.max_order_quantity,
        stock_quantity: data.stock_quantity,
        availability_status: data.availability_status,
        is_active: data.is_active,
        is_featured: data.is_featured,
        discount_percentage: data.discount_percentage,
        tags: data.tags,
        specifications: data.specifications as any,
        bulk_pricing: bulkPricingTiers as any,
        dealer_locations: data.dealer_locations as any,
        images
      };
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Product updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating product', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (productId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = form.getValues('tags') || [];
      form.setValue('tags', [...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const addBulkPricingTier = () => {
    setBulkPricingTiers([...bulkPricingTiers, { quantity: 0, price: 0, discount: 0 }]);
  };

  const removeBulkPricingTier = (index: number) => {
    setBulkPricingTiers(bulkPricingTiers.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Basic product details and categorization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="e.g., Organic NPK Fertilizer"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    {...form.register('sku')}
                    placeholder="e.g., NPK-ORG-001"
                  />
                  {form.formState.errors.sku && (
                    <p className="text-sm text-destructive">{form.formState.errors.sku.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    {...form.register('brand')}
                    placeholder="e.g., Green Valley"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => form.setValue('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Product description..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    {...form.register('stock_quantity', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability_status">Availability Status</Label>
                  <Select onValueChange={(value) => form.setValue('availability_status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_type">Unit Type</Label>
                  <Select onValueChange={(value) => form.setValue('unit_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="packet">Packet</SelectItem>
                      <SelectItem value="bag">Bag</SelectItem>
                      <SelectItem value="bottle">Bottle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={form.watch('is_active')}
                    onCheckedChange={(checked) => form.setValue('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={form.watch('is_featured')}
                    onCheckedChange={(checked) => form.setValue('is_featured', checked)}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>Configure pricing tiers and inventory settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_per_unit">Price per Unit *</Label>
                  <Input
                    id="price_per_unit"
                    type="number"
                    step="0.01"
                    {...form.register('price_per_unit', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_order_quantity">Min Order Quantity</Label>
                  <Input
                    id="min_order_quantity"
                    type="number"
                    {...form.register('min_order_quantity', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_order_quantity">Max Order Quantity</Label>
                  <Input
                    id="max_order_quantity"
                    type="number"
                    {...form.register('max_order_quantity', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Bulk Pricing Tiers</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addBulkPricingTier}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tier
                  </Button>
                </div>
                {bulkPricingTiers.map((tier, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Input
                      placeholder="Quantity"
                      type="number"
                      value={tier.quantity}
                      onChange={(e) => {
                        const newTiers = [...bulkPricingTiers];
                        newTiers[index].quantity = Number(e.target.value);
                        setBulkPricingTiers(newTiers);
                      }}
                    />
                    <Input
                      placeholder="Price"
                      type="number"
                      step="0.01"
                      value={tier.price}
                      onChange={(e) => {
                        const newTiers = [...bulkPricingTiers];
                        newTiers[index].price = Number(e.target.value);
                        setBulkPricingTiers(newTiers);
                      }}
                    />
                    <Input
                      placeholder="Discount %"
                      type="number"
                      value={tier.discount}
                      onChange={(e) => {
                        const newTiers = [...bulkPricingTiers];
                        newTiers[index].discount = Number(e.target.value);
                        setBulkPricingTiers(newTiers);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeBulkPricingTier(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage product content and media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label>Product Tags</Label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {form.watch('tags')?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Product Images</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload images or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality & Compliance</CardTitle>
              <CardDescription>Certification and regulatory information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Compliance features will be implemented in the next phase.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Settings</CardTitle>
              <CardDescription>Configure tracking and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analytics configuration will be implemented in the next phase.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {productId ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}