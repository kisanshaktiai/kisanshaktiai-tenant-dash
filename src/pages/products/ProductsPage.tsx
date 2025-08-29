
import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import ProductList from './components/ProductList';
import CategoryManagement from './components/CategoryManagement';
import PricingManagement from './components/PricingManagement';
import BulkImport from './components/BulkImport';
import ProductAnalytics from './components/ProductAnalytics';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleEdit = (productId: string) => {
    console.log('Edit product:', productId);
    // TODO: Implement edit functionality
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8" />
            Product Catalog
          </h1>
          <p className="text-muted-foreground">
            Manage your agricultural products and inventory
          </p>
        </div>
        <div className="flex space-x-2">
          <PermissionGuard permission="products.create">
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
              <Download className="mr-2 h-4 w-4" />
              Import Products
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <PermissionGuard permission="products.edit">
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </PermissionGuard>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductList onEdit={handleEdit} onCreate={handleCreate} />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagement />
        </TabsContent>

        <PermissionGuard permission="products.edit">
          <TabsContent value="pricing">
            <PricingManagement />
          </TabsContent>
        </PermissionGuard>

        <TabsContent value="analytics">
          <ProductAnalytics />
        </TabsContent>

        <TabsContent value="import">
          <BulkImport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
