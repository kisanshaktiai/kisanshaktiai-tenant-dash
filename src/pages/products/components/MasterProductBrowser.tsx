
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export default function MasterProductBrowser() {
  const { currentTenant } = useTenantIsolation();
  const { user } = useAppSelector(state => state.auth);
  const queryClient = useQueryClient();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [filters, setFilters] = useState<MasterDataFilters>({});
  const [page, setPage] = useState(1);

  // Real-time subscription for master products
  useEffect(() => {
    const channel = supabase
      .channel('master-products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'master_products'
        },
        (payload) => {
          console.log('Master product change detected:', payload);
          // Invalidate all master product queries
          queryClient.invalidateQueries({ queryKey: ['master-products'] });
          queryClient.invalidateQueries({ queryKey: ['master-companies'] });
          queryClient.invalidateQueries({ queryKey: ['master-categories'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl">Smart Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative group">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                <Input
                  id="search-products"
                  name="search"
                  placeholder="Search by name, SKU, or brand..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9 border-2 transition-all focus:border-primary hover:border-primary/50"
                />
              </div>
            </div>

            <Select
              value={filters.company_id || 'all'}
              onValueChange={(value) => setFilters({ ...filters, company_id: value === 'all' ? undefined : value })}
            >
              <SelectTrigger id="company-filter" className="border-2 hover:border-primary/50 transition-all">
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
              <SelectTrigger id="category-filter" className="border-2 hover:border-primary/50 transition-all">
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
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                id="select-all-products"
                checked={selectedProducts.size > 0 && selectedProducts.size === productsData?.products.length}
                onCheckedChange={handleSelectAll}
                className="transition-transform hover:scale-110"
              />
              <label htmlFor="select-all-products" className="text-sm font-semibold cursor-pointer hover:text-primary transition-colors">
                Select All
              </label>
              {selectedProducts.size > 0 && (
                <Badge variant="default" className="animate-scale-in">
                  {selectedProducts.size} selected
                </Badge>
              )}
            </div>
            <Button
              onClick={() => setShowPreview(true)}
              disabled={selectedProducts.size === 0}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all shadow-md hover:shadow-lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Import ({selectedProducts.size})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productsData?.products.map(product => (
                  <Card 
                    key={product.id} 
                    className={cn(
                      "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                      "border-2 hover:border-primary/50",
                      selectedProducts.has(product.id) && "border-primary shadow-lg shadow-primary/20"
                    )}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`product-${product.id}`}
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                          className="mt-0.5 transition-transform hover:scale-110"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 font-medium">{product.brand}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs bg-accent/30 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground font-medium">SKU</span>
                          <span className="font-mono font-semibold text-foreground">{product.sku}</span>
                        </div>
                        {product.price_per_unit && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">Price</span>
                            <span className="font-bold text-primary">₹{product.price_per_unit}</span>
                          </div>
                        )}
                        {product.company && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">Company</span>
                            <span className="truncate ml-2 font-semibold text-foreground">{product.company.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {product.is_organic && (
                          <Badge variant="outline" className="text-xs border-green-500/50 text-green-600 dark:text-green-400 bg-green-500/10">
                            Organic
                          </Badge>
                        )}
                        {product.product_type && (
                          <Badge variant="secondary" className="text-xs font-semibold">
                            {product.product_type}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    
                    {/* Hover gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </Card>
                ))}
              </div>

              {productsData && productsData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8 pb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="hover:bg-primary/5 hover:border-primary transition-all disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <div className="px-4 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-sm font-semibold text-primary">
                      Page {page} of {productsData.totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(productsData.totalPages, p + 1))}
                    disabled={page === productsData.totalPages}
                    className="hover:bg-primary/5 hover:border-primary transition-all disabled:opacity-50"
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
