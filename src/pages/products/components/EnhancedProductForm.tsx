
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
  Package,
  DollarSign,
  Globe,
  Shield,
  BarChart,
  Plus,
  X,
  Upload
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
  discount_percentage: z.number().min(0).max(100).optional(),
  stock_quantity: z.number().min(0, 'Stock quantity must be non-negative'),
  minimum_stock_level: z.number().int().optional(),
  reorder_point: z.number().int().optional(),
  availability_status: z.string(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  product_type: z.string().optional(),
  is_organic: z.boolean().optional(),
  manufacturer: z.string().optional(),
  storage_conditions: z.string().optional(),
  shelf_life_months: z.number().int().optional(),
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
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [documents, setDocuments] = useState<Array<{ name: string; url: string; type: string }>>([]);
  const [variants, setVariants] = useState<Array<{ name: string; sku: string; price_modifier: number; attributes: Record<string, string> }>>([]);
  const [technicalSpecs, setTechnicalSpecs] = useState<Record<string, string>>({});
  const [certifications, setCertifications] = useState<Array<{ name: string; issuer: string; certificate_number: string; issue_date: string; expiry_date?: string; document_url?: string }>>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      brand: '',
      category_id: '',
      description: '',
      price_per_unit: 0,
      unit_type: 'kg',
      min_order_quantity: 1,
      max_order_quantity: undefined,
      discount_percentage: 0,
      stock_quantity: 0,
      minimum_stock_level: 10,
      reorder_point: 20,
      availability_status: 'in_stock',
      is_active: true,
      is_featured: false,
      product_type: 'general',
      is_organic: false,
      manufacturer: '',
      storage_conditions: '',
      shelf_life_months: undefined,
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
        name: product.name || '',
        sku: product.sku || '',
        brand: product.brand || '',
        category_id: product.category_id || '',
        description: product.description || '',
        price_per_unit: product.price_per_unit || 0,
        unit_type: product.unit_type || 'kg',
        min_order_quantity: product.min_order_quantity || 1,
        max_order_quantity: product.max_order_quantity || undefined,
        discount_percentage: product.discount_percentage || 0,
        stock_quantity: product.stock_quantity || 0,
        minimum_stock_level: product.minimum_stock_level || 10,
        reorder_point: product.reorder_point || 20,
        availability_status: product.availability_status || 'in_stock',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        product_type: product.product_type || 'general',
        is_organic: product.is_organic ?? false,
        manufacturer: product.manufacturer || '',
        storage_conditions: product.storage_conditions || '',
        shelf_life_months: product.shelf_life_months || undefined,
      });
      setImages(product.images || []);
    }
  }, [product, form]);

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Ensure all required fields are present
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
        discount_percentage: data.discount_percentage || 0,
        stock_quantity: data.stock_quantity,
        minimum_stock_level: data.minimum_stock_level || 10,
        reorder_point: data.reorder_point || 20,
        availability_status: data.availability_status,
        is_active: data.is_active,
        is_featured: data.is_featured,
        product_type: data.product_type || 'general',
        is_organic: data.is_organic || false,
        manufacturer: data.manufacturer,
        storage_conditions: data.storage_conditions,
        shelf_life_months: data.shelf_life_months,
        tenant_id: getTenantId(),
        images: images,
        tags: [],
        bulk_pricing: [],
        dealer_locations: [],
        credit_options: {},
        specifications: {},
        active_ingredients: [],
        target_pests: [],
        target_diseases: [],
        suitable_crops: [],
        nutrient_composition: {},
        certification_details: {},
        stock_movement_history: [],
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
        discount_percentage: data.discount_percentage,
        stock_quantity: data.stock_quantity,
        minimum_stock_level: data.minimum_stock_level,
        reorder_point: data.reorder_point,
        availability_status: data.availability_status,
        is_active: data.is_active,
        is_featured: data.is_featured,
        product_type: data.product_type,
        is_organic: data.is_organic,
        manufacturer: data.manufacturer,
        storage_conditions: data.storage_conditions,
        shelf_life_months: data.shelf_life_months,
        images: images,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('products')
        .update(updateData)
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

  const addVariant = () => {
    setVariants([...variants, { name: '', sku: '', price_modifier: 0, attributes: {} }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addTechnicalSpec = (key: string, value: string) => {
    setTechnicalSpecs({ ...technicalSpecs, [key]: value });
  };

  const removeTechnicalSpec = (key: string) => {
    const newSpecs = { ...technicalSpecs };
    delete newSpecs[key];
    setTechnicalSpecs(newSpecs);
  };

  const addCertification = () => {
    setCertifications([...certifications, {
      name: '',
      issuer: '',
      certificate_number: '',
      issue_date: '',
    }]);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="compliance" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart className="h-3 w-3" />
            Analytics
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
                  {form.formState.errors.brand && (
                    <p className="text-sm text-destructive">{form.formState.errors.brand.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => form.setValue('category_id', value)} value={form.watch('category_id')}>
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
                  {form.formState.errors.category_id && (
                    <p className="text-sm text-destructive">{form.formState.errors.category_id.message}</p>
                  )}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit_type">Unit Type *</Label>
                  <Select onValueChange={(value) => form.setValue('unit_type', value)} value={form.watch('unit_type')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="packet">Packet</SelectItem>
                      <SelectItem value="bag">Bag</SelectItem>
                      <SelectItem value="bottle">Bottle</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.unit_type && (
                    <p className="text-sm text-destructive">{form.formState.errors.unit_type.message}</p>
                  )}
                </div>

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
                  <Select onValueChange={(value) => form.setValue('availability_status', value)} value={form.watch('availability_status')}>
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

          {/* Product Variants Section */}
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>Manage different variations of this product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Variants</Label>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </div>
              {variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Input
                    placeholder="Variant Name"
                    value={variant.name}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[index].name = e.target.value;
                      setVariants(newVariants);
                    }}
                  />
                  <Input
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[index].sku = e.target.value;
                      setVariants(newVariants);
                    }}
                  />
                  <Input
                    placeholder="Price Modifier"
                    type="number"
                    step="0.01"
                    value={variant.price_modifier}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[index].price_modifier = Number(e.target.value);
                      setVariants(newVariants);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeVariant(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
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
                  {form.formState.errors.price_per_unit && (
                    <p className="text-sm text-destructive">{form.formState.errors.price_per_unit.message}</p>
                  )}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Rich media and content for this product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Media Gallery */}
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
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img src={image} alt={`Product ${index + 1}`} className="w-full h-32 object-cover rounded" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setImages(images.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Technical Specifications */}
              <div className="space-y-4">
                <Label>Technical Specifications</Label>
                <div className="space-y-2">
                  {Object.entries(technicalSpecs).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4">
                      <Badge variant="outline">{key}: {value}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTechnicalSpec(key)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality & Compliance</CardTitle>
              <CardDescription>Certifications and compliance information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Certifications</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCertification}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>
              </div>
              {certifications.map((cert, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  <Input
                    placeholder="Certificate Name"
                    value={cert.name}
                    onChange={(e) => {
                      const newCerts = [...certifications];
                      newCerts[index].name = e.target.value;
                      setCertifications(newCerts);
                    }}
                  />
                  <Input
                    placeholder="Issuer"
                    value={cert.issuer}
                    onChange={(e) => {
                      const newCerts = [...certifications];
                      newCerts[index].issuer = e.target.value;
                      setCertifications(newCerts);
                    }}
                  />
                  <Input
                    placeholder="Certificate Number"
                    value={cert.certificate_number}
                    onChange={(e) => {
                      const newCerts = [...certifications];
                      newCerts[index].certificate_number = e.target.value;
                      setCertifications(newCerts);
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      placeholder="Issue Date"
                      value={cert.issue_date}
                      onChange={(e) => {
                        const newCerts = [...certifications];
                        newCerts[index].issue_date = e.target.value;
                        setCertifications(newCerts);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCertification(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Configuration</CardTitle>
              <CardDescription>Configure tracking and analytics for this product</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Product analytics and tracking configuration will be available once the product is created.
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
