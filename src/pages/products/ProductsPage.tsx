import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, BarChart3, Settings, Upload } from 'lucide-react';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import CategoryManagement from './components/CategoryManagement';
import ProductAnalytics from './components/ProductAnalytics';
import BulkImport from './components/BulkImport';
import PricingManagement from './components/PricingManagement';

export default function ProductsPage() {
  const [selectedTab, setSelectedTab] = useState('products');
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Catalog</h1>
          <p className="text-muted-foreground">
            Manage your agricultural products and services catalog
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSelectedTab('bulk-import')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="bulk-import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import/Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {isCreating || editingProduct ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isCreating ? 'Create New Product' : 'Edit Product'}
                </CardTitle>
                <CardDescription>
                  {isCreating ? 'Add a new product to your catalog' : 'Update product information'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductForm
                  productId={editingProduct}
                  onCancel={() => {
                    setIsCreating(false);
                    setEditingProduct(null);
                  }}
                  onSuccess={() => {
                    setIsCreating(false);
                    setEditingProduct(null);
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <ProductList
              onEdit={setEditingProduct}
              onCreate={() => setIsCreating(true)}
            />
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoryManagement />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <PricingManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ProductAnalytics />
        </TabsContent>

        <TabsContent value="bulk-import" className="space-y-6">
          <BulkImport />
        </TabsContent>
      </Tabs>
    </div>
  );
}