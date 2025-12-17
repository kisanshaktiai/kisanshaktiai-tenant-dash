import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';
import type { SalesOrder, OrderStatus } from '@/types/sales';
import { useNavigate } from 'react-router-dom';

interface OrdersKanbanProps {
  orders: SalesOrder[];
  isLoading: boolean;
}

const statusColumns: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Pending', color: 'border-amber-500/50 bg-amber-500/5' },
  { status: 'confirmed', label: 'Confirmed', color: 'border-blue-500/50 bg-blue-500/5' },
  { status: 'processing', label: 'Processing', color: 'border-purple-500/50 bg-purple-500/5' },
  { status: 'fulfilled', label: 'Fulfilled', color: 'border-cyan-500/50 bg-cyan-500/5' },
  { status: 'delivered', label: 'Delivered', color: 'border-emerald-500/50 bg-emerald-500/5' },
];

export function OrdersKanban({ orders, isLoading }: OrdersKanbanProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    );
  }

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders?.filter((order) => order.order_status === status) || [];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statusColumns.map((column) => {
        const columnOrders = getOrdersByStatus(column.status);
        return (
          <div key={column.status} className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{column.label}</h3>
              <Badge variant="secondary" className="rounded-full">
                {columnOrders.length}
              </Badge>
            </div>

            <div className={`rounded-lg border-2 border-dashed ${column.color} p-3 space-y-3 min-h-96`}>
              {columnOrders.map((order) => (
                <Card
                  key={order.id}
                  className="p-3 space-y-2 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 bg-card/80 backdrop-blur-sm"
                  onClick={() => navigate(`/app/sales/${order.id}`)}
                >
                  <div className="font-medium text-sm">{order.order_number}</div>
                  
                  <div className="flex items-center gap-1 text-lg font-bold">
                    <DollarSign className="h-4 w-4" />
                    {Number(order.total_amount).toFixed(2)}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Farmer #{order.farmer_id.slice(0, 8)}
                    </div>
                    <div>{format(new Date(order.created_at), 'MMM dd, hh:mm a')}</div>
                  </div>

                  <Badge
                    variant="outline"
                    className={
                      order.payment_status === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-500 text-xs'
                        : 'bg-amber-500/10 text-amber-500 text-xs'
                    }
                  >
                    {order.payment_status}
                  </Badge>
                </Card>
              ))}

              {columnOrders.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No orders
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
