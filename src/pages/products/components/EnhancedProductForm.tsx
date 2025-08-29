
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
  BarChart,
  MapPin,
  Calendar,
  FileText,
  Camera,
  Video,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';

const enhancedProductSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  brand: z.string().min(1, 'Brand is required'),
  category_id: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  short_description: z.string().max(200).optional(),
  
  // Multi-language support
  name_translations: z.record(z.string()).optional(),
  description_translations: z.record(z.string()).optional(),
  
  // Pricing & Inventory
  price_per_unit: z.number().min(0, 'Price must be positive'),
  unit_type: z.string().min(1, 'Unit type is required'),
  min_order_quantity: z.number().min(1, 'Minimum order quantity must be at least 1'),
  max_order_quantity: z.number().optional(),
  stock_quantity: z.number().min(0, 'Stock quantity must be non-negative'),
  availability_status: z.string(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  
  // Advanced Features
  variants: z.array(z.object({
    name: z.string(),
    sku: z.string(),
    price_modifier: z.number(),
    attributes: z.record(z.string())
  })).optional(),
  
  specifications: z.record(z.string()).optional(),
  technical_specs: z.array(z.object({
    name: z.string(),
    value: z.string(),
    unit: z.string().optional()
  })).optional(),
  
  usage_instructions: z.string().optional(),
  safety_information: z.string().optional(),
  
  // Quality & Compliance
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    certificate_number: z.string(),
    issue_date: z.string(),
    expiry_date: z.string().optional(),
    document_url: z.string().optional()
  })).optional(),
  
  batch_info: z.object({
    batch_number: z.string().optional(),
    manufacturing_date: z.string().optional(),
    expiry_date: z.string().optional(),
    quality_grade: z.string().optional()
  }).optional(),
  
  // Distribution
  geographic_availability: z.array(z.string()).optional(),
  authorized_dealers: z.array(z.string()).optional(),
  delivery_estimates: z.record(z.number()).optional(),
  shipping_restrictions: z.array(z.string()).optional(),
  
  // SEO & Content
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.array(z.string()).optional(),
  meta_tags: z.record(z.string()).optional(),
  
  // Media
  images: z.array(z.string()).optional(),
  videos: z.array(z.object({
    title: z.string(),
    url: z.string(),
    thumbnail: z.string().optional(),
    duration: z.number().optional()
  })).optional(),
  
  documents: z.array(z.object({
    name: z.string(),
    type: z.string(),
    url: z.string(),
    size: z.number().optional()
  })).optional(),
  
  // Analytics
  tags: z.array(z.string()).optional(),
  search_terms: z.array(z.string()).optional()
});

type EnhancedProductFormData = z.infer<typeof enhancedProductSchema>;

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
  const [variants, setVariants] = useState<Array<{name: string, sku: string, price_modifier: number, attributes: Record<string, string>}>>([]);
  const [certifications, setCertifications] = useState<Array<{name: string, issuer: string, certificate_number: string, issue_date: string, expiry_date?: string, document_url?: string}>>([]);

  const form = useForm<EnhancedProductFormData>({
    resolver: zodResolver(enhancedProductSchema),
    defaultValues: {
      is_active: true,
      is_featured: false,
      min_order_quantity: 1,
      availability_status: 'in_stock',
      tags: [],
      variants: [],
      specifications: {},
      certifications: [],
      geographic_availability: [],
      authorized_dealers: []
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

  // Fetch categories with hierarchical structure
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
        // Enhanced fields
        name_translations: product.name_translations as Record<string, string> || {},
        description_translations: product.description_translations as Record<string, string> || {},
        variants: product.variants as any[] || [],
        specifications: product.specifications as Record<string, string> || {},
        technical_specs: product.technical_specs as any[] || [],
        usage_instructions: product.usage_instructions || '',
        safety_information: product.safety_information || '',
        certifications: product.certifications as any[] || [],
        batch_info: product.batch_info as any || {},
        geographic_availability: product.geographic_availability as string[] || [],
        authorized_dealers: product.authorized_dealers as string[] || [],
        seo_title: product.seo_title || '',
        seo_description: product.seo_description || '',
        seo_keywords: product.seo_keywords as string[] || [],
        tags: product.tags as string[] || []
      });
      
      setImages(product.images || []);
      setVariants(product.variants as any[] || []);
      setCertifications(product.certifications as any[] || []);
    }
  }, [product, form]);

  const createMutation = useMutation({
    mutationFn: async (data: EnhancedProductFormData) => {
      const insertData = {
        ...data,
        images,
        variants,
        certifications,
        tenant_id: getTenantId()
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
    mutationFn: async (data: EnhancedProductFormData) => {
      const updateData = {
        ...data,
        images,
        variants,
        certifications
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

  const onSubmit = (data: EnhancedProductFormData) => {
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

  const addCertification = () => {
    setCertifications([...certifications, { 
      name: '', 
      issuer: '', 
      certificate_number: '', 
      issue_date: '' 
    }]);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="basic" className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="variants" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Variants
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
          <TabsTrigger value="distribution" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Distribution
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

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  {...form.register('short_description')}
                  placeholder="Brief product summary (max 200 characters)..."
                  rows={2}
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

        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Variants & SKUs</CardTitle>
              <CardDescription>Manage different variations of this product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Product Variants</Label>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </div>
              
              {variants.map((variant, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Variant Name</Label>
                      <Input
                        placeholder="e.g., 50kg Bag"
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index].name = e.target.value;
                          setVariants(newVariants);
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Variant SKU</Label>
                      <Input
                        placeholder="e.g., NPK-ORG-001-50KG"
                        value={variant.sku}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index].sku = e.target.value;
                          setVariants(newVariants);
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Price Modifier (%)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={variant.price_modifier}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index].price_modifier = Number(e.target.value);
                          setVariants(newVariants);
                        }}
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVariant(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>Configure pricing rules and inventory settings</CardDescription>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content & SEO</CardTitle>
              <CardDescription>Manage product content and search optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usage_instructions">Usage Instructions</Label>
                <Textarea
                  id="usage_instructions"
                  {...form.register('usage_instructions')}
                  placeholder="Detailed usage instructions..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="safety_information">Safety Information</Label>
                <Textarea
                  id="safety_information"
                  {...form.register('safety_information')}
                  placeholder="Safety guidelines and precautions..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    {...form.register('seo_title')}
                    placeholder="SEO optimized title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Input
                    id="seo_description"
                    {...form.register('seo_description')}
                    placeholder="SEO meta description..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media Gallery</CardTitle>
              <CardDescription>Manage product images, videos, and documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-4">
                <Label>Video Tutorials</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Upload video tutorials or add YouTube links
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Documents & Manuals</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Upload PDF manuals, data sheets, and documentation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribution Control</CardTitle>
              <CardDescription>Configure geographic availability and dealer settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Geographic Availability</Label>
                <p className="text-sm text-muted-foreground">
                  Select regions where this product is available for sale
                </p>
                {/* Geographic selection component would go here */}
              </div>

              <div className="space-y-2">
                <Label>Authorized Dealers</Label>
                <p className="text-sm text-muted-foreground">
                  Select dealers authorized to sell this product
                </p>
                {/* Dealer selection component would go here */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Delivery Time (Days)</Label>
                  <Input
                    type="number"
                    placeholder="Standard delivery time"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Shipping Cost per Unit</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Shipping cost calculation"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality & Compliance</CardTitle>
              <CardDescription>Manage certifications, quality parameters, and compliance documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Certifications</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCertification}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                </div>
                
                {certifications.map((cert, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Certificate Name</Label>
                        <Input
                          placeholder="e.g., Organic Certification"
                          value={cert.name}
                          onChange={(e) => {
                            const newCerts = [...certifications];
                            newCerts[index].name = e.target.value;
                            setCertifications(newCerts);
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Issuing Authority</Label>
                        <Input
                          placeholder="e.g., IFOAM"
                          value={cert.issuer}
                          onChange={(e) => {
                            const newCerts = [...certifications];
                            newCerts[index].issuer = e.target.value;
                            setCertifications(newCerts);
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Certificate Number</Label>
                        <Input
                          placeholder="Certificate ID/Number"
                          value={cert.certificate_number}
                          onChange={(e) => {
                            const newCerts = [...certifications];
                            newCerts[index].certificate_number = e.target.value;
                            setCertifications(newCerts);
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Issue Date</Label>
                        <Input
                          type="date"
                          value={cert.issue_date}
                          onChange={(e) => {
                            const newCerts = [...certifications];
                            newCerts[index].issue_date = e.target.value;
                            setCertifications(newCerts);
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={cert.expiry_date || ''}
                          onChange={(e) => {
                            const newCerts = [...certifications];
                            newCerts[index].expiry_date = e.target.value;
                            setCertifications(newCerts);
                          }}
                        />
                      </div>
                      
                      <div className="flex items-end">
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
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & SEO</CardTitle>
              <CardDescription>Configure tracking and search optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analytics and tracking configuration will be available after product creation.
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
