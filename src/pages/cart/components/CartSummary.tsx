import { useState, useMemo } from 'react';
import { useCartQuery, useCartItemsQuery, useUpdateCartItemMutation, useRemoveFromCartMutation } from '@/hooks/data/useCartQuery';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDroppable } from '@dnd-kit/core';
import { Trash2, Minus, Plus, Tag, ShoppingBag, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CartSummaryProps {
  farmerId: string;
  onCheckout: () => void;
}

export function CartSummary({ farmerId, onCheckout }: CartSummaryProps) {
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percentage: number } | null>(null);

  const { data: cart } = useCartQuery(farmerId);
  const { data: cartItems = [], isLoading } = useCartItemsQuery(cart?.id);
  const updateItemMutation = useUpdateCartItemMutation();
  const removeItemMutation = useRemoveFromCartMutation();

  const { setNodeRef, isOver } = useDroppable({
    id: 'cart-drop-zone',
  });

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percentage) / 100 : 0;
    const taxAmount = (subtotal - discountAmount) * 0.18; // 18% GST
    const total = subtotal - discountAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  }, [cartItems, appliedDiscount]);

  const handleUpdateQuantity = async (itemId: string, currentQty: number, change: number) => {
    const newQty = Math.max(1, currentQty + change);
    try {
      await updateItemMutation.mutateAsync({ itemId, quantity: newQty });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItemMutation.mutateAsync(itemId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
    }
  };

  const handleApplyDiscount = () => {
    // Mock discount codes
    const validCodes: Record<string, number> = {
      'SAVE10': 10,
      'SAVE20': 20,
      'FARMER50': 50,
    };

    const discount = validCodes[discountCode.toUpperCase()];
    if (discount) {
      setAppliedDiscount({ code: discountCode.toUpperCase(), percentage: discount });
      toast.success(`${discount}% discount applied!`);
      setDiscountCode('');
    } else {
      toast.error('Invalid discount code');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'sticky top-6 transition-all',
        isOver && 'ring-2 ring-primary shadow-lg'
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Shopping Cart
          {cartItems.length > 0 && (
            <Badge variant="secondary">{cartItems.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Cart is empty</p>
            <p className="text-sm mt-1">Drag products here or click + to add</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate text-sm">{item.product_id}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="font-semibold">
                      ₹{(item.unit_price * item.quantity).toLocaleString()}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Discount Code */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4" />
                Discount Code
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                />
                <Button variant="outline" onClick={handleApplyDiscount}>
                  Apply
                </Button>
              </div>
              {appliedDiscount && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Percent className="h-3 w-3" />
                  <span>
                    {appliedDiscount.code} - {appliedDiscount.percentage}% off applied
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 ml-auto"
                    onClick={() => setAppliedDiscount(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{calculations.subtotal.toLocaleString()}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount ({appliedDiscount.percentage}%)</span>
                  <span>-₹{calculations.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (18% GST)</span>
                <span className="font-medium">₹{calculations.taxAmount.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{calculations.total.toLocaleString()}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {cartItems.length > 0 && (
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={onCheckout}
          >
            Proceed to Checkout
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
