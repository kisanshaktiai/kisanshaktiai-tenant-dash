
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
import { useTranslation } from '@/hooks/useTranslation';

export default function ProductsPage() {
  const [selectedTab, setSelectedTab] = useState('products');
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('products.title')}</h1>
          <p className="text-muted-foreground">
            {t('products.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSelectedTab('bulk-import')}
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('products.bulkImport')}
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('products.addProduct')}
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t('products.products')}
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('products.categories')}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('products.pricing')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('products.analytics')}
          </TabsTrigger>
          <TabsTrigger value="bulk-import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t('products.importExport')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {isCreating || editingProduct ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isCreating ? t('products.createNew') : t('products.edit')}
                </CardTitle>
                <CardDescription>
                  {isCreating ? t('products.addNewDescription') : t('products.updateDescription')}
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
