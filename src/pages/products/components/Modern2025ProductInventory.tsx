import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LayoutGrid,
  List,
  LayoutList,
  Search,
  Filter,
  SlidersHorizontal,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  ArrowUpDown,
  Boxes,
  Leaf,
  Award,
  Calendar,
  DollarSign,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useRealTimeProductsQuery } from '@/hooks/data/useRealTimeProductsQuery';
import { cn } from '@/lib/utils';
import ProductDetailsModal from './ProductDetailsModal';
import StockManagementModal from './StockManagementModal';

interface Modern2025ProductInventoryProps {
  searchTerm?: string;
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
}

type ViewType = 'grid' | 'list' | 'compact';
type SortBy = 'name' | 'price' | 'stock' | 'updated';

const Modern2025ProductInventory: React.FC<Modern2025ProductInventoryProps> = ({
  searchTerm = '',
  onEdit,
  onDelete,
}) => {
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  const searchQuery = searchTerm || localSearch;
  const { data: productsData, isLoading, refetch, isLive } = useRealTimeProductsQuery({
    search: searchQuery,
    limit: 100,
  });
  
  const products = productsData?.data || [];

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    let filtered = [...products];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => 
        filterStatus === 'active' ? p.is_active : !p.is_active
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.product_type === filterCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return (b.price_per_unit || 0) - (a.price_per_unit || 0);
        case 'stock':
          return (b.stock_quantity || 0) - (a.stock_quantity || 0);
        case 'updated':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filterStatus, filterCategory, sortBy]);

  // Calculate metrics
  const metrics = React.useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.is_active).length;
    const lowStock = products.filter(p => 
      (p.stock_quantity || 0) < (p.reorder_point || 0)
    ).length;
    const totalValue = products.reduce((sum, p) => 
      sum + ((p.price_per_unit || 0) * (p.stock_quantity || 0)), 0
    );

    return { total, active, lowStock, totalValue };
  }, [products]);

  const getStockStatus = (product: any) => {
    const stock = product.stock_quantity || 0;
    const minLevel = product.minimum_stock_level || 0;
    const reorderPoint = product.reorder_point || 0;

    if (stock === 0) return { status: 'Out of Stock', color: 'destructive', icon: XCircle };
    if (stock < minLevel) return { status: 'Critical', color: 'destructive', icon: AlertCircle };
    if (stock < reorderPoint) return { status: 'Low Stock', color: 'warning', icon: AlertCircle };
    return { status: 'In Stock', color: 'success', icon: CheckCircle2 };
  };

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const handleManageStock = (product: any) => {
    setSelectedProduct(product);
    setShowStockModal(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden group hover:shadow-glow transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 group-hover:opacity-10 transition-opacity" />
          <div className="relative p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <Sparkles className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Products</p>
              <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {metrics.total}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="w-3 h-3" />
              <span>{metrics.active} Active</span>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-glow transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-growth opacity-5 group-hover:opacity-10 transition-opacity" />
          <div className="relative p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-success/10 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <Sparkles className="w-4 h-4 text-success/40 group-hover:text-success transition-colors" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Active Items</p>
              <p className="text-3xl font-bold text-success">
                {metrics.active}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{((metrics.active / metrics.total) * 100).toFixed(0)}% of total</span>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-glow transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-harvest opacity-5 group-hover:opacity-10 transition-opacity" />
          <div className="relative p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-warning/10 group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
              <Sparkles className="w-4 h-4 text-warning/40 group-hover:text-warning transition-colors" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Low Stock Alerts</p>
              <p className="text-3xl font-bold text-warning">
                {metrics.lowStock}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-warning">
              <AlertCircle className="w-3 h-3" />
              <span>Needs attention</span>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-glow transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 group-hover:opacity-10 transition-opacity" />
          <div className="relative p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-info/10 group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-6 h-6 text-info" />
              </div>
              <Sparkles className="w-4 h-4 text-info/40 group-hover:text-info transition-colors" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Inventory Value</p>
              <p className="text-3xl font-bold text-info">
                ₹{(metrics.totalValue / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Total stock value</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-2">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU, or category..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 h-12 bg-background border-2 focus:border-primary transition-colors"
              />
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => refetch()}
              className="gap-2 border-2 hover:border-primary hover:bg-primary/5"
            >
              <RefreshCw className={cn("w-4 h-4", isLive && "animate-spin")} />
              {isLive ? 'Live' : 'Refresh'}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 border-2">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 border-2">
                <Boxes className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="fertilizer">Fertilizers</SelectItem>
                <SelectItem value="pesticide">Pesticides</SelectItem>
                <SelectItem value="seed">Seeds</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-40 border-2">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="updated">Recently Updated</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />

            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border-2">
              <Button
                variant={viewType === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('grid')}
                className="gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewType === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('list')}
                className="gap-2"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant={viewType === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('compact')}
                className="gap-2"
              >
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">Compact</span>
              </Button>
            </div>
          </div>

          {filteredProducts.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="w-4 h-4" />
              <span>Showing {filteredProducts.length} of {metrics.total} products</span>
            </div>
          )}
        </div>
      </Card>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-6 rounded-full bg-muted/50">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Start by adding your first product'}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {viewType === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const stockInfo = getStockStatus(product);
                const StockIcon = stockInfo.icon;

                return (
                  <Card
                    key={product.id}
                    className="group relative overflow-hidden hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
                    <div className="relative p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            SKU: {product.sku}
                          </p>
                        </div>
                        <Badge
                          variant={product.is_active ? 'default' : 'secondary'}
                          className="shrink-0"
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {/* Product Type & Category */}
                      <div className="flex flex-wrap gap-2">
                        {product.product_type && (
                          <Badge variant="outline" className="gap-1">
                            <Boxes className="w-3 h-3" />
                            {product.product_type}
                          </Badge>
                        )}
                        {product.is_organic && (
                          <Badge variant="outline" className="gap-1 border-success text-success">
                            <Leaf className="w-3 h-3" />
                            Organic
                          </Badge>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Stock</span>
                          <div className="flex items-center gap-1">
                            <StockIcon className={cn("w-4 h-4", 
                              stockInfo.color === 'success' && "text-success",
                              stockInfo.color === 'warning' && "text-warning",
                              stockInfo.color === 'destructive' && "text-destructive"
                            )} />
                            <span className={cn("text-sm font-medium",
                              stockInfo.color === 'success' && "text-success",
                              stockInfo.color === 'warning' && "text-warning",
                              stockInfo.color === 'destructive' && "text-destructive"
                            )}>
                              {stockInfo.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Quantity</span>
                          <span className="font-semibold">
                            {product.stock_quantity || 0} {product.unit_type}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="pt-3 border-t">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-muted-foreground">Price</span>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              ₹{product.price_per_unit?.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              per {product.unit_type}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(product)}
                          className="flex-1 gap-2 hover:bg-primary/5 hover:border-primary"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManageStock(product)}
                          className="gap-2 hover:bg-success/5 hover:border-success hover:text-success"
                        >
                          <Package className="w-4 h-4" />
                        </Button>
                        {onEdit && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(product.id)}
                            className="gap-2 hover:bg-info/5 hover:border-info hover:text-info"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {viewType === 'list' && (
            <Card className="overflow-hidden border-2">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b-2">
                    <tr>
                      <th className="text-left p-4 font-semibold">Product</th>
                      <th className="text-left p-4 font-semibold">Category</th>
                      <th className="text-left p-4 font-semibold">Stock</th>
                      <th className="text-left p-4 font-semibold">Price</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-right p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, index) => {
                      const stockInfo = getStockStatus(product);
                      const StockIcon = stockInfo.icon;

                      return (
                        <tr
                          key={product.id}
                          className={cn(
                            "border-b transition-colors hover:bg-muted/30",
                            index % 2 === 0 && "bg-muted/10"
                          )}
                        >
                          <td className="p-4">
                            <div>
                              <p className="font-semibold hover:text-primary transition-colors cursor-pointer">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {product.product_type && (
                                <Badge variant="outline">
                                  {product.product_type}
                                </Badge>
                              )}
                              {product.is_organic && (
                                <Badge variant="outline" className="border-success text-success">
                                  <Leaf className="w-3 h-3 mr-1" />
                                  Organic
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <StockIcon className={cn("w-4 h-4",
                                stockInfo.color === 'success' && "text-success",
                                stockInfo.color === 'warning' && "text-warning",
                                stockInfo.color === 'destructive' && "text-destructive"
                              )} />
                              <div>
                                <p className="font-semibold">
                                  {product.stock_quantity || 0} {product.unit_type}
                                </p>
                                <p className={cn("text-xs",
                                  stockInfo.color === 'success' && "text-success",
                                  stockInfo.color === 'warning' && "text-warning",
                                  stockInfo.color === 'destructive' && "text-destructive"
                                )}>
                                  {stockInfo.status}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-primary">
                              ₹{product.price_per_unit?.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              per {product.unit_type}
                            </p>
                          </td>
                          <td className="p-4">
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetails(product)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleManageStock(product)}
                              >
                                <Package className="w-4 h-4" />
                              </Button>
                              {onEdit && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onEdit(product.id)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              {onDelete && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onDelete(product.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {viewType === 'compact' && (
            <Card className="divide-y border-2">
              {filteredProducts.map((product) => {
                const stockInfo = getStockStatus(product);
                const StockIcon = stockInfo.icon;

                return (
                  <div
                    key={product.id}
                    className="p-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                          <Badge
                            variant={product.is_active ? 'default' : 'secondary'}
                            className="shrink-0"
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Boxes className="w-3 h-3" />
                            {product.product_type}
                          </span>
                          <span>•</span>
                          <span>SKU: {product.sku}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <StockIcon className={cn("w-3 h-3",
                              stockInfo.color === 'success' && "text-success",
                              stockInfo.color === 'warning' && "text-warning",
                              stockInfo.color === 'destructive' && "text-destructive"
                            )} />
                            {product.stock_quantity || 0} {product.unit_type}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-primary">
                          ₹{product.price_per_unit?.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          per {product.unit_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(product)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleManageStock(product)}
                        >
                          <Package className="w-4 h-4" />
                        </Button>
                        {onEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(product.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </>
      )}

      {/* Modals */}
      {selectedProduct && (
        <>
          <ProductDetailsModal
            open={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
          />
          <StockManagementModal
            open={showStockModal}
            onClose={() => {
              setShowStockModal(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
          />
        </>
      )}
    </div>
  );
};

export default Modern2025ProductInventory;