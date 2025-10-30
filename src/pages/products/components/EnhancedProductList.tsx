import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProductsQuery } from '@/hooks/data/useProductsQuery';
import { Eye, Edit, Trash2, Package, AlertTriangle, CheckCircle, Leaf, Beaker, Plus, Minus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import StockManagementModal from './StockManagementModal';
import ProductDetailsModal from './ProductDetailsModal';

export interface EnhancedProductListProps {
  searchTerm: string;
  selectedProducts: string[];
  onSelectedProductsChange: (products: string[]) => void;
  productType?: string;
  onEditProduct?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
}

const EnhancedProductList: React.FC<EnhancedProductListProps> = ({
  searchTerm,
  selectedProducts,
  onSelectedProductsChange,
  productType = 'all',
  onEditProduct,
  onDeleteProduct
}) => {
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [filterType, setFilterType] = useState(productType);
  const [filterOrganic, setFilterOrganic] = useState<string>('all');

  const { data: productsData, isLoading, error } = useProductsQuery({
    search: searchTerm,
    limit: 100
  });

  const products = productsData?.data || [];

  // Filter products based on type and organic status
  const filteredProducts = products.filter(product => {
    if (filterType !== 'all' && product.product_type !== filterType) return false;
    if (filterOrganic !== 'all' && product.is_organic !== (filterOrganic === 'organic')) return false;
    return true;
  });

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      onSelectedProductsChange([]);
    } else {
      onSelectedProductsChange(filteredProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      onSelectedProductsChange(selectedProducts.filter(id => id !== productId));
    } else {
      onSelectedProductsChange([...selectedProducts, productId]);
    }
  };

  const getStockStatus = (product: any) => {
    const percentage = (product.stock_quantity / (product.minimum_stock_level || 100)) * 100;
    if (percentage <= 25) return { color: 'destructive', icon: AlertTriangle, text: 'Critical' };
    if (percentage <= 50) return { color: 'warning', icon: AlertTriangle, text: 'Low' };
    if (percentage <= 75) return { color: 'secondary', icon: Package, text: 'Medium' };
    return { color: 'success', icon: CheckCircle, text: 'Good' };
  };

  const getProductTypeColor = (type: string) => {
    switch (type) {
      case 'fertilizer': return 'bg-emerald-500';
      case 'pesticide': return 'bg-red-500';
      case 'medicine': return 'bg-blue-500';
      case 'seed': return 'bg-green-500';
      case 'equipment': return 'bg-gray-500';
      default: return 'bg-slate-500';
    }
  };

  const openStockModal = (product: any) => {
    setSelectedProduct(product);
    setStockModalOpen(true);
  };

  const openDetailsModal = (product: any) => {
    setSelectedProduct(product);
    setDetailsModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Loading products...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-destructive">Error loading products</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Agricultural Products Inventory</CardTitle>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Product Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fertilizer">Fertilizers</SelectItem>
                  <SelectItem value="pesticide">Pesticides</SelectItem>
                  <SelectItem value="medicine">Medicines</SelectItem>
                  <SelectItem value="seed">Seeds</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterOrganic} onValueChange={setFilterOrganic}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Organic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="organic">Organic</SelectItem>
                  <SelectItem value="non-organic">Non-Organic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Product Details</TableHead>
                  <TableHead>Type & Category</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Certifications</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const StockIcon = stockStatus.icon;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => handleSelectProduct(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product.name}</span>
                            {product.is_organic && (
                              <Badge variant="outline" className="text-xs">
                                <Leaf className="w-3 h-3 mr-1" />
                                Organic
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            SKU: {product.sku} | {product.manufacturer || 'Unknown Manufacturer'}
                          </div>
                          {product.active_ingredients?.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {product.active_ingredients.slice(0, 3).map((ingredient: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  <Beaker className="w-3 h-3 mr-1" />
                                  {ingredient}
                                </Badge>
                              ))}
                              {product.active_ingredients.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{product.active_ingredients.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getProductTypeColor(product.product_type)}>
                            {product.product_type}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {product.brand}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <StockIcon className="w-4 h-4" />
                            <Badge variant={stockStatus.color as any}>
                              {stockStatus.text}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Stock: {product.stock_quantity}</span>
                              <span>Min: {product.minimum_stock_level}</span>
                            </div>
                            <Progress 
                              value={(product.stock_quantity / (product.minimum_stock_level || 100)) * 100} 
                              className="h-2"
                            />
                          </div>
                          {product.stock_quantity <= product.reorder_point && (
                            <Badge variant="destructive" className="text-xs">
                              Reorder Required
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">₹{product.price_per_unit}</div>
                          <div className="text-xs text-muted-foreground">
                            per {product.unit_type}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {product.certification_details?.organic && (
                            <Badge variant="outline" className="text-xs">
                              Organic Certified
                            </Badge>
                          )}
                          {product.certification_details?.iso && (
                            <Badge variant="outline" className="text-xs">
                              ISO Certified
                            </Badge>
                          )}
                          {!product.certification_details?.organic && !product.certification_details?.iso && (
                            <span className="text-xs text-muted-foreground">No certifications</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.expiry_date ? (
                          <div className="space-y-1">
                            <div className="text-xs">
                              {new Date(product.expiry_date).toLocaleDateString()}
                            </div>
                            {new Date(product.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                              <Badge variant="destructive" className="text-xs">
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDetailsModal(product)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openStockModal(product)}
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditProduct?.(product.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteProduct?.(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedProduct && (
        <>
          <StockManagementModal
            open={stockModalOpen}
            onClose={() => setStockModalOpen(false)}
            product={selectedProduct}
          />
          <ProductDetailsModal
            open={detailsModalOpen}
            onClose={() => setDetailsModalOpen(false)}
            product={selectedProduct}
          />
        </>
      )}
    </>
  );
};

export default EnhancedProductList;