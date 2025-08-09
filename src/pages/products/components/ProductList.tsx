
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Eye, 
  Trash2,
  Package,
  TrendingUp,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRealTimeProductsQuery } from '@/hooks/data/useRealTimeProductsQuery';

interface ProductListProps {
  onEdit: (productId: string) => void;
  onCreate: () => void;
}

export default function ProductList({ onEdit, onCreate }: ProductListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { 
    data: productsData, 
    isLoading, 
    isLive, 
    activeChannels 
  } = useRealTimeProductsQuery({
    search,
    status: statusFilter,
    category: categoryFilter,
  });

  const products = productsData?.data || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      in_stock: 'default',
      low_stock: 'secondary',
      out_of_stock: 'destructive',
      discontinued: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStockIcon = (quantity: number) => {
    if (quantity === 0) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (quantity < 10) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return <Package className="h-4 w-4 text-primary" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({products?.length || 0})
            </CardTitle>
            <LiveIndicator isConnected={isLive} activeChannels={activeChannels} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU, or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.is_featured && (
                          <Badge variant="secondary" className="text-xs">Featured</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>
                    ₹{product.price_per_unit?.toLocaleString()} / {product.unit_type}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStockIcon(product.stock_quantity || 0)}
                      {product.stock_quantity || 0}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(product.availability_status || 'in_stock')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(product.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {products?.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first product to the catalog.
              </p>
              <Button onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
