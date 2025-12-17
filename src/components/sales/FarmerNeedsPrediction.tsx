import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Package, TrendingUp } from 'lucide-react';
import { useFarmerUpcomingNeeds } from '@/hooks/data/usePredictiveSales';
import { Skeleton } from '@/components/ui/skeleton';

interface FarmerNeedsPredictionProps {
  farmerId: string;
  days?: number;
  onCreateOrder?: (farmerId: string) => void;
}

export const FarmerNeedsPrediction = ({ 
  farmerId, 
  days = 30,
  onCreateOrder 
}: FarmerNeedsPredictionProps) => {
  const { data: needs, isLoading } = useFarmerUpcomingNeeds(farmerId, days);

  const getUrgencyBadge = (daysUntil: number) => {
    if (daysUntil <= 3) {
      return <Badge variant="destructive">Urgent ({daysUntil}d)</Badge>;
    }
    if (daysUntil <= 7) {
      return <Badge variant="default" className="bg-orange-500">Soon ({daysUntil}d)</Badge>;
    }
    return <Badge variant="secondary">{daysUntil} days</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Upcoming Needs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!needs || needs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Upcoming Needs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No upcoming tasks scheduled in the next {days} days.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Upcoming Needs ({needs.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3">
          {needs.map((need) => (
            <div
              key={need.task_id}
              className="border rounded-lg p-3 space-y-2 hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{need.task_name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(parseISO(need.task_date), 'MMM dd, yyyy')}
                  </div>
                </div>
                {getUrgencyBadge(need.days_until_task)}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Package className="h-3 w-3" />
                <span className="text-muted-foreground">
                  {need.crop_name} {need.crop_variety ? `(${need.crop_variety})` : ''}
                </span>
              </div>

              {need.resources && (
                <div className="text-sm text-muted-foreground">
                  Resources: {JSON.stringify(need.resources)}
                </div>
              )}

              {need.estimated_cost && (
                <div className="text-sm font-medium">
                  Est. Cost: ₹{need.estimated_cost.toLocaleString()}
                </div>
              )}

              {onCreateOrder && need.days_until_task <= 7 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => onCreateOrder(farmerId)}
                >
                  Create Proactive Order
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
