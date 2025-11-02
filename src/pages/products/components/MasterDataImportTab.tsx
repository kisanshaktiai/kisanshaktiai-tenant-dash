
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Package, History } from 'lucide-react';
import MasterCategoryBrowser from './MasterCategoryBrowser';
import MasterProductBrowser from './MasterProductBrowser';
import ImportHistoryView from './ImportHistoryView';

export default function MasterDataImportTab() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Master Catalog Import</CardTitle>
              <CardDescription className="text-base">
                Browse and import products and categories from the master catalog
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Import History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <MasterProductBrowser />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <MasterCategoryBrowser />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ImportHistoryView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
