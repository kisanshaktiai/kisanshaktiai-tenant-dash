
import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Package, Settings, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import ProductList from './components/ProductList';
import EnhancedCategoryManagement from './components/EnhancedCategoryManagement';
import PricingManagement from './components/PricingManagement';
import BulkImport from './components/BulkImport';
import AdvancedProductAnalytics from './components/AdvancedProductAnalytics';
import EnhancedProductForm from './components/EnhancedProductForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleEdit = (productId: string) => {
    setEditingProductId(productId);
    setIsCreateModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProductId(null);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingProductId(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8" />
            Product Catalog Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive product management with advanced analytics and insights
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
          <CardTitle>Search & Filter Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU, brand, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Bulk Actions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <PermissionGuard permission="products.edit">
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Pricing
            </TabsTrigger>
          </PermissionGuard>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Import/Export
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductList 
            onEdit={handleEdit} 
            onCreate={handleCreate} 
            searchTerm={searchTerm}
          />
        </TabsContent>

        <TabsContent value="categories">
          <EnhancedCategoryManagement />
        </TabsContent>

        <PermissionGuard permission="products.edit">
          <TabsContent value="pricing">
            <PricingManagement />
          </TabsContent>
        </PermissionGuard>

        <TabsContent value="analytics">
          <AdvancedProductAnalytics />
        </TabsContent>

        <TabsContent value="import">
          <BulkImport />
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Quality & Compliance Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-2">Certifications</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Manage product certifications and compliance documents
                      </p>
                      <Button variant="outline" size="sm">View Certifications</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-2">Quality Control</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Track quality parameters and batch information
                      </p>
                      <Button variant="outline" size="sm">Quality Dashboard</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-2">Regulatory Compliance</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Ensure compliance with agricultural regulations
                      </p>
                      <Button variant="outline" size="sm">Compliance Check</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Product Form Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProductId ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
          </DialogHeader>
          <EnhancedProductForm
            productId={editingProductId}
            onCancel={handleCloseModal}
            onSuccess={handleCloseModal}
          />
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      {isImportModalOpen && (
        <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Import Products</DialogTitle>
            </DialogHeader>
            <BulkImport />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
