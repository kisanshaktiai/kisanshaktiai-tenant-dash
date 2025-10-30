import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Leaf, 
  Bug, 
  Droplets, 
  Sprout,
  Shield,
  BarChart3,
  FileText
} from 'lucide-react';
import EnhancedProductForm from './EnhancedProductForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);

  const productTypes = [
    {
      type: 'fertilizer',
      title: 'Fertilizer',
      description: 'NPK, Organic, Micronutrients',
      icon: Leaf,
      color: 'text-green-600 bg-green-50'
    },
    {
      type: 'pesticide',
      title: 'Pesticide',
      description: 'Insecticides, Herbicides, Fungicides',
      icon: Bug,
      color: 'text-red-600 bg-red-50'
    },
    {
      type: 'medicine',
      title: 'Medicine',
      description: 'Growth promoters, Plant medicines',
      icon: Shield,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      type: 'seed',
      title: 'Seeds',
      description: 'Hybrid, Organic, Traditional varieties',
      icon: Sprout,
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      type: 'equipment',
      title: 'Equipment',
      description: 'Tools, Irrigation, Machinery',
      icon: Droplets,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      type: 'general',
      title: 'General',
      description: 'Other agricultural products',
      icon: Package,
      color: 'text-gray-600 bg-gray-50'
    }
  ];

  const handleProductTypeSelect = (type: string) => {
    setSelectedProductType(type);
  };

  const handleClose = () => {
    setSelectedProductType(null);
    onClose();
  };

  const handleSuccess = () => {
    setSelectedProductType(null);
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Add New Agricultural Product
          </DialogTitle>
          <DialogDescription>
            Create comprehensive product listings with agricultural-specific details
          </DialogDescription>
        </DialogHeader>

        {!selectedProductType ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {productTypes.map((productType) => {
              const Icon = productType.icon;
              return (
                <Card 
                  key={productType.type}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => handleProductTypeSelect(productType.type)}
                >
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-lg ${productType.color} mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{productType.title}</h3>
                    <p className="text-sm text-muted-foreground">{productType.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <Tabs defaultValue="form" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="form">
                  <FileText className="mr-2 h-4 w-4" />
                  Product Details
                </TabsTrigger>
                <TabsTrigger value="agricultural">
                  <Leaf className="mr-2 h-4 w-4" />
                  Agricultural Info
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics Setup
                </TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="space-y-4">
                <EnhancedAgriProductForm 
                  productType={selectedProductType}
                  onCancel={handleClose}
                  onSuccess={handleSuccess}
                />
              </TabsContent>

              <TabsContent value="agricultural" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Agricultural Specifications</CardTitle>
                    <CardDescription>
                      Add detailed agricultural information for AI recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Agricultural details will be configured in the main form
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics & Tracking</CardTitle>
                    <CardDescription>
                      Set up performance tracking and analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Analytics will be automatically configured upon product creation
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Enhanced Agricultural Product Form Component
function EnhancedAgriProductForm({ 
  productType, 
  onCancel, 
  onSuccess 
}: { 
  productType: string; 
  onCancel: () => void; 
  onSuccess: () => void;
}) {
  return (
    <EnhancedProductForm
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  );
}