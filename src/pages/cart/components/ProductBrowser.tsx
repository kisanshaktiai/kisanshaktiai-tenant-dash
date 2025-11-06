import { useState } from 'react';
import { useProductsQuery } from '@/hooks/data/useProductsQuery';
import { useCartQuery, useCreateCartMutation, useAddToCartMutation } from '@/hooks/data/useCartQuery';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, GripVertical } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

interface ProductBrowserProps {
  farmerId: string;
}

function DraggableProductCard({ product, onAdd }: { product: any; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `product-${product.id}`,
    data: { product },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group hover:shadow-lg transition-all cursor-grab active:cursor-grabbing"
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div
            {...listeners}
            {...attributes}
            className="flex items-center text-muted-foreground hover:text-foreground cursor-grab"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h4 className="font-semibold truncate">{product.name}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {product.product_type || 'Uncategorized'}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0"
                onClick={onAdd}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                ₹{product.price_per_unit?.toLocaleString() || 0}
              </span>
              {product.stock_quantity !== undefined && (
                <Badge variant={product.stock_quantity > 0 ? 'default' : 'destructive'}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductBrowser({ farmerId }: ProductBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: productsResult, isLoading } = useProductsQuery();
  const products = productsResult?.data || [];
  const { data: cart } = useCartQuery(farmerId);
  const createCartMutation = useCreateCartMutation();
  const addToCartMutation = useAddToCartMutation();

  const handleAddToCart = async (product: any) => {
    try {
      let cartId = cart?.id;

      // Create cart if it doesn't exist
      if (!cartId) {
        const newCart = await createCartMutation.mutateAsync({ farmerId });
        cartId = newCart.id;
      }

      await addToCartMutation.mutateAsync({
        cartId,
        farmerId,
        data: {
          product_id: product.id,
          quantity: 1,
        },
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Product Grid */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {filteredProducts?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No products found
          </div>
        ) : (
          filteredProducts?.map((product) => (
            <DraggableProductCard
              key={product.id}
              product={product}
              onAdd={() => handleAddToCart(product)}
            />
          ))
        )}
      </div>
    </div>
  );
}
