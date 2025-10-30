import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Leaf, 
  Beaker, 
  Calendar, 
  Shield, 
  Droplets,
  Wheat,
  Bug,
  Heart,
  AlertTriangle,
  Info,
  Clock,
  Factory
} from 'lucide-react';

interface ProductDetailsModalProps {
  open: boolean;
  onClose: () => void;
  product: any;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  open,
  onClose,
  product
}) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {product.name}
            {product.is_organic && (
              <Badge variant="outline" className="ml-2">
                <Leaf className="w-3 h-3 mr-1" />
                Organic
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="composition">Composition</TabsTrigger>
            <TabsTrigger value="application">Application</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="stock">Stock Info</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-medium">{product.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Product Type</p>
                  <Badge className="mt-1">{product.product_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturer</p>
                  <p className="font-medium">{product.manufacturer || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">₹{product.price_per_unit} per {product.unit_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Batch Number</p>
                  <p className="font-medium">{product.batch_number || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Dates & Shelf Life
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturing Date</p>
                  <p className="font-medium">
                    {product.manufacturing_date 
                      ? new Date(product.manufacturing_date).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <p className="font-medium">
                    {product.expiry_date 
                      ? new Date(product.expiry_date).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shelf Life</p>
                  <p className="font-medium">{product.shelf_life_months || 'N/A'} months</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Storage Conditions</p>
                  <p className="font-medium">{product.storage_conditions || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="composition" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Beaker className="w-4 h-4" />
                  Active Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.active_ingredients?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {product.active_ingredients.map((ingredient: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active ingredients specified</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nutrient Composition</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(product.nutrient_composition || {}).length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(product.nutrient_composition).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm text-muted-foreground">{key}</p>
                        <p className="font-medium">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No nutrient composition specified</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Physical Properties</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">pH Range</p>
                  <p className="font-medium">{product.ph_range || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Solubility</p>
                  <p className="font-medium">{product.solubility || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="application" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wheat className="w-4 h-4" />
                  Suitable Crops
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.suitable_crops?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {product.suitable_crops.map((crop: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Suitable for all crops</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Target Pests & Diseases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Target Pests</p>
                  {product.target_pests?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.target_pests.map((pest: string, idx: number) => (
                        <Badge key={idx} variant="destructive">
                          {pest}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">N/A</p>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Target Diseases</p>
                  {product.target_diseases?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.target_diseases.map((disease: string, idx: number) => (
                        <Badge key={idx} variant="destructive">
                          {disease}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">N/A</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Method</p>
                  <p className="font-medium">{product.application_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dosage Instructions</p>
                  <p className="font-medium">{product.dosage_instructions || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Waiting Period</p>
                  <p className="font-medium">
                    {product.waiting_period_days 
                      ? `${product.waiting_period_days} days` 
                      : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Safety & Precautions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">
                  {product.safety_precautions || 'No specific safety precautions listed'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(product.certification_details || {}).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(product.certification_details).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{key}</span>
                        <Badge variant="outline">{String(value)}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No certifications available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Stock Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Stock</p>
                  <p className="font-medium">{product.stock_quantity} {product.unit_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Minimum Stock Level</p>
                  <p className="font-medium">{product.minimum_stock_level} {product.unit_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reorder Point</p>
                  <p className="font-medium">{product.reorder_point} {product.unit_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Restocked</p>
                  <p className="font-medium">
                    {product.last_restocked_at 
                      ? new Date(product.last_restocked_at).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Availability Status</p>
                  <Badge variant={product.availability_status === 'in_stock' ? 'secondary' : 'destructive'}>
                    {product.availability_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={product.is_active ? 'secondary' : 'destructive'}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;