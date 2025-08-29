
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
import { 
  Package,
  DollarSign,
  Globe,
  Camera,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';

// Schema based on actual database fields
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
});

type ProductFormData = z.infer<typeof productSchema>;

interface EnhancedProductFormProps {
  productId?: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function EnhancedProductForm({ productId, onCancel, onSuccess }: EnhancedProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getTenantId } = useTenantIsolation();
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_active: true,
      is_featured: false,
      min_order_quantity: 1,
      availability_status: 'in_stock',
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
        .eq('tenant_id', getTenantId())
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories', getTenantId()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('tenant_id', getTenantId())
        .eq('is_active', true)
        .order('sort_order');
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
      });
    }
  }, [product, form]);

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { error } = await supabase
        .from('products')
        .insert({
          ...data,
          tenant_id: getTenantId()
        });
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
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', productId)
        .eq('tenant_id', getTenantId());
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Content
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-1">
            <Camera className="h-3 w-3" />
            Media
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Product Information</CardTitle>
              <CardDescription>Essential product details and categorization</CardDescription>
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
                  placeholder="Detailed product description..."
                  rows={4}
                />
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
              <CardDescription>Configure pricing and inventory settings</CardDescription>
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

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    {...form.register('stock_quantity', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Additional content and specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced content management features like multi-language support, SEO fields, and technical specifications will be available in future updates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media Gallery</CardTitle>
              <CardDescription>Product images and media</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Media management features including image uploads, video tutorials, and document attachments will be available in future updates.
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
