import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Calendar, Package, ShoppingCart } from 'lucide-react';
import { useFarmerUpcomingNeeds } from '@/hooks/data/usePredictiveSales';
import { format, parseISO } from 'date-fns';

interface SmartProductRecommendationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmerId: string;
  farmerName: string;
  onAddToCart?: (products: Array<{ product_type: string; quantity: number }>) => void;
}

export const SmartProductRecommendation = ({
  open,
  onOpenChange,
  farmerId,
  farmerName,
  onAddToCart,
}: SmartProductRecommendationProps) => {
  const { data: needs, isLoading } = useFarmerUpcomingNeeds(farmerId, 14);
  const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(new Set());

  const toggleRecommendation = (taskId: string) => {
    const newSelected = new Set(selectedRecommendations);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedRecommendations(newSelected);
  };

  const handleAddToCart = () => {
    if (!needs || !onAddToCart) return;

    const selectedNeeds = needs.filter((need) =>
      selectedRecommendations.has(need.task_id)
    );

    const products = selectedNeeds.map((need) => ({
      product_type: need.task_type,
      quantity: need.resources?.quantity || 1,
    }));

    onAddToCart(products);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Recommendations for {farmerName}
          </DialogTitle>
          <DialogDescription>
            Based on upcoming crop schedule and task requirements
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading recommendations...
          </div>
        ) : !needs || needs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No upcoming tasks found in the next 14 days.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Found {needs.length} upcoming {needs.length === 1 ? 'task' : 'tasks'} requiring products
            </div>

            <div className="space-y-3">
              {needs.map((need) => (
                <Card
                  key={need.task_id}
                  className={`cursor-pointer transition-colors ${
                    selectedRecommendations.has(need.task_id)
                      ? 'border-primary bg-accent'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => toggleRecommendation(need.task_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-1 flex-1">
                        <div className="font-medium">{need.task_name}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(need.task_date), 'MMM dd, yyyy')}
                          <span>({need.days_until_task} days)</span>
                        </div>
                      </div>
                      <Badge
                        variant={need.days_until_task <= 7 ? 'default' : 'secondary'}
                      >
                        {need.days_until_task <= 3 ? 'Urgent' : need.days_until_task <= 7 ? 'Soon' : 'Upcoming'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Package className="h-3 w-3" />
                      <span className="text-muted-foreground">
                        {need.crop_name} {need.crop_variety ? `(${need.crop_variety})` : ''}
                      </span>
                    </div>

                    <div className="space-y-1 bg-muted/50 rounded p-2 text-sm">
                      <div className="font-medium">Recommended Products:</div>
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{need.task_type}</span>
                        <span className="text-muted-foreground">
                          Qty: {need.resources?.quantity || 1}
                        </span>
                      </div>
                      {need.estimated_cost && (
                        <div className="text-xs text-muted-foreground">
                          Est. ₹{need.estimated_cost.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={selectedRecommendations.size === 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add {selectedRecommendations.size} to Cart
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
