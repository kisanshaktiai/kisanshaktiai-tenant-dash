import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreVertical, Eye, Edit, XCircle, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { SalesOrder } from '@/types/sales';
import { cn } from '@/lib/utils';

interface OrdersTableProps {
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

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const navigate = useNavigate();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleRow = (orderId: string) => {
    setExpandedRows((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const toggleSelect = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
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
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedOrders.length === orders.length}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <>
              <TableRow
                key={order.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer group"
                onClick={() => navigate(`/app/sales/${order.id}`)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={() => toggleSelect(order.id)}
                  />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRow(order.id);
                    }}
                  >
                    {expandedRows.includes(order.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">Farmer #{order.farmer_id.slice(0, 8)}</div>
                    {order.dealer_id && (
                      <div className="text-xs text-muted-foreground">
                        via Dealer #{order.dealer_id.slice(0, 8)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  ${Number(order.total_amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'capitalize',
                      statusColors[order.order_status as keyof typeof statusColors]
                    )}
                  >
                    {order.order_status}
                  </Badge>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(order.created_at), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/app/sales/${order.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Order
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MapPin className="mr-2 h-4 w-4" />
                        Track Delivery
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              {expandedRows.includes(order.id) && (
                <TableRow>
                  <TableCell colSpan={9} className="bg-muted/20 p-4">
                    <div className="text-sm space-y-2">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <span className="text-muted-foreground">Order Type:</span>{' '}
                          <span className="font-medium capitalize">{order.order_type}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Source:</span>{' '}
                          <span className="font-medium capitalize">{order.order_source}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fulfillment:</span>{' '}
                          <span className="font-medium capitalize">
                            {order.fulfillment_status}
                          </span>
                        </div>
                      </div>
                      {order.notes && (
                        <div>
                          <span className="text-muted-foreground">Notes:</span> {order.notes}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
