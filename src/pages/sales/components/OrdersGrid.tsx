import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreVertical, Calendar, DollarSign, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import type { SalesOrder } from '@/types/sales';
import { cn } from '@/lib/utils';

interface OrdersGridProps {
  orders: SalesOrder[];
  isLoading: boolean;
}

const statusColors = {
  draft: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  processing: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  fulfilled: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  returned: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

export function OrdersGrid({ orders, isLoading }: OrdersGridProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order, index) => (
        <Card
          key={order.id}
          className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer backdrop-blur-sm bg-card/50 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={() => navigate(`/app/sales/${order.id}`)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {format(new Date(order.created_at), 'MMM dd, yyyy')}
                </p>
                <p className="text-lg font-bold">{order.order_number}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'capitalize',
                  statusColors[order.order_status as keyof typeof statusColors]
                )}
              >
                {order.order_status}
              </Badge>
              <Badge
                variant="outline"
                className={
                  order.payment_status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-amber-500/10 text-amber-500'
                }
              >
                {order.payment_status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-lg">
                  ${Number(order.total_amount).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Farmer #{order.farmer_id.slice(0, 8)}</span>
              </div>

              {order.dealer_id && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>via Dealer #{order.dealer_id.slice(0, 8)}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                <span className="capitalize">{order.order_type}</span> •{' '}
                <span className="capitalize">{order.order_source}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
