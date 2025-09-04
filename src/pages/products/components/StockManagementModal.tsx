import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Minus, RotateCcw, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

interface StockManagementModalProps {
  open: boolean;
  onClose: () => void;
  product: any;
}

const StockManagementModal: React.FC<StockManagementModalProps> = ({
  open,
  onClose,
  product
}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setIsSubmitting(true);

    try {
      const quantityNum = parseInt(quantity);
      let newStock = product.stock_quantity;

      if (movementType === 'in') {
        newStock += quantityNum;
      } else if (movementType === 'out') {
        if (quantityNum > product.stock_quantity) {
          toast.error('Insufficient stock');
          setIsSubmitting(false);
          return;
        }
        newStock -= quantityNum;
      } else {
        newStock = quantityNum;
      }

      // Record stock movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          tenant_id: currentTenant?.id,
          product_id: product.id,
          movement_type: movementType,
          quantity: quantityNum,
          previous_stock: product.stock_quantity,
          new_stock: newStock,
          reason,
          reference_number: referenceNumber,
          performed_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (movementError) throw movementError;

      toast.success('Stock updated successfully');
      onClose();
      window.location.reload(); // Refresh to show updated stock
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMovementIcon = () => {
    switch (movementType) {
      case 'in': return <Plus className="w-4 h-4" />;
      case 'out': return <Minus className="w-4 h-4" />;
      case 'adjustment': return <RotateCcw className="w-4 h-4" />;
    }
  };

  const getMovementColor = () => {
    switch (movementType) {
      case 'in': return 'text-green-600';
      case 'out': return 'text-red-600';
      case 'adjustment': return 'text-blue-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Stock Management - {product?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Stock Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current Stock</p>
                  <p className="text-2xl font-bold">{product?.stock_quantity}</p>
                  <p className="text-xs text-muted-foreground">{product?.unit_type}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Minimum Level</p>
                  <p className="text-2xl font-bold">{product?.minimum_stock_level}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Reorder Point</p>
                  <p className="text-2xl font-bold">{product?.reorder_point}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {product?.stock_quantity <= product?.reorder_point ? (
                    <Badge variant="destructive" className="mt-2">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Low Stock
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-2">
                      Normal
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Movement Type */}
          <div className="space-y-2">
            <Label>Movement Type</Label>
            <Select value={movementType} onValueChange={(value: any) => setMovementType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Stock In (Purchase/Return)
                  </div>
                </SelectItem>
                <SelectItem value="out">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    Stock Out (Sale/Damage)
                  </div>
                </SelectItem>
                <SelectItem value="adjustment">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-blue-600" />
                    Stock Adjustment
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>
              {movementType === 'adjustment' ? 'New Stock Level' : 'Quantity'}
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="pl-8"
              />
              <div className={`absolute left-2 top-2.5 ${getMovementColor()}`}>
                {getMovementIcon()}
              </div>
            </div>
            {movementType !== 'adjustment' && quantity && (
              <p className="text-sm text-muted-foreground">
                New stock will be: {
                  movementType === 'in' 
                    ? product.stock_quantity + parseInt(quantity || '0')
                    : product.stock_quantity - parseInt(quantity || '0')
                } {product.unit_type}
              </p>
            )}
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <Label>Reference Number (Optional)</Label>
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g., PO-2024-001, INV-2024-001"
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason / Notes</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for stock movement..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Stock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockManagementModal;