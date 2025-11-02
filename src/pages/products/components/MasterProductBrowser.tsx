
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Package, Download, Loader2 } from 'lucide-react';
import { masterDataService, type MasterProduct, type MasterDataFilters } from '@/services/MasterDataService';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { useAppSelector } from '@/store/hooks';
import ImportPreviewModal from './ImportPreviewModal';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MasterProductBrowser() {
  const { currentTenant } = useTenantIsolation();
  const { user } = useAppSelector(state => state.auth);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [filters, setFilters] = useState<MasterDataFilters>({});
  const [page, setPage] = useState(1);

  // Fetch companies for filter
  const { data: companies } = useQuery({
    queryKey: ['master-companies'],
    queryFn: () => masterDataService.getCompanies(),
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['master-categories'],
    queryFn: () => masterDataService.getCategories(),
  });

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['master-products', filters, page],
    queryFn: () => masterDataService.getProducts(filters, page, 20),
  });

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && productsData?.products) {
      setSelectedProducts(new Set(productsData.products.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const selectedProductsList = productsData?.products.filter(p => selectedProducts.has(p.id)) || [];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-products"
                  name="search"
                  placeholder="Search by name, SKU, or brand..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <Select
              value={filters.company_id || 'all'}
              onValueChange={(value) => setFilters({ ...filters, company_id: value === 'all' ? undefined : value })}
            >
              <SelectTrigger id="company-filter">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies?.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.category_id || 'all'}
              onValueChange={(value) => setFilters({ ...filters, category_id: value === 'all' ? undefined : value })}
            >
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-products"
                checked={selectedProducts.size > 0 && selectedProducts.size === productsData?.products.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all-products" className="text-sm font-medium cursor-pointer">
                Select All
              </label>
              {selectedProducts.size > 0 && (
                <Badge variant="secondary">{selectedProducts.size} selected</Badge>
              )}
            </div>
            <Button
              onClick={() => setShowPreview(true)}
              disabled={selectedProducts.size === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Import Selected ({selectedProducts.size})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productsData?.products.map(product => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <Checkbox
                          id={`product-${product.id}`}
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                        />
                        <div className="flex-1 ml-3">
                          <h4 className="font-semibold text-sm line-clamp-2">{product.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{product.brand}</p>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SKU:</span>
                          <span className="font-mono">{product.sku}</span>
                        </div>
                        {product.price_per_unit && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price:</span>
                            <span className="font-semibold">₹{product.price_per_unit}</span>
                          </div>
                        )}
                        {product.company && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Company:</span>
                            <span className="truncate ml-2">{product.company.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {product.is_organic && (
                          <Badge variant="outline" className="text-xs">Organic</Badge>
                        )}
                        {product.product_type && (
                          <Badge variant="secondary" className="text-xs">{product.product_type}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {productsData && productsData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {productsData.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(productsData.totalPages, p + 1))}
                    disabled={page === productsData.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Import Preview Modal */}
      {showPreview && (
        <ImportPreviewModal
          type="product"
          items={selectedProductsList}
          onClose={() => setShowPreview(false)}
          onSuccess={() => {
            setSelectedProducts(new Set());
            setShowPreview(false);
          }}
        />
      )}
    </div>
  );
}
