
import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Package, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ProductList from './components/ProductList';
import CategoryManagement from './components/CategoryManagement';
import PricingManagement from './components/PricingManagement';
import BulkImport from './components/BulkImport';
import ProductAnalytics from './components/ProductAnalytics';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8" />
            Product Catalog
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg mt-2">
            Manage your agricultural product portfolio and inventory
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" disabled={selectedProducts.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export ({selectedProducts.length})
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Products
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Search & Filter</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {selectedProducts.length} selected
              </Badge>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, category, SKU, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductList 
            searchTerm={searchTerm}
            selectedProducts={selectedProducts}
            onSelectedProductsChange={setSelectedProducts}
          />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagement />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingManagement />
        </TabsContent>

        <TabsContent value="import">
          <BulkImport />
        </TabsContent>

        <TabsContent value="analytics">
          <ProductAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
