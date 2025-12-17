import { useParams } from 'react-router-dom';
import { useOrderQuery, useOrderItemsQuery } from '@/hooks/data/useOrdersQuery';
import { useDeliveryQuery } from '@/hooks/data/useDeliveryQuery';
import { useFulfillmentQuery } from '@/hooks/data/useFulfillmentQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  User,
  MapPin,
  Truck,
  CreditCard,
  Calendar,
  FileText,
  Printer,
  Mail,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrderQuery(orderId);
  const { data: orderItems } = useOrderItemsQuery(orderId);
  const { data: delivery } = useDeliveryQuery(orderId);
  const { data: fulfillment } = useFulfillmentQuery(orderId);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="p-6">Order not found</div>;
  }

  const statusTimeline = [
    { status: 'pending', label: 'Order Placed', time: order.created_at, completed: true },
    {
      status: 'confirmed',
      label: 'Confirmed',
      time: order.confirmed_at,
      completed: !!order.confirmed_at,
    },
    {
      status: 'processing',
      label: 'Processing',
      time: fulfillment?.packed_at,
      completed: !!fulfillment?.packed_at,
    },
    {
      status: 'fulfilled',
      label: 'Shipped',
      time: fulfillment?.shipped_at,
      completed: !!fulfillment?.shipped_at,
    },
    {
      status: 'delivered',
      label: 'Delivered',
      time: order.delivered_at,
      completed: !!order.delivered_at,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{order.order_number}</h1>
          <p className="text-muted-foreground mt-1">
            Created {format(new Date(order.created_at), 'PPP')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Send to Customer
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel - Order Summary */}
        <div className="space-y-6">
          <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${Number(order.subtotal_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">${Number(order.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-emerald-500">
                    -${Number(order.discount_amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">${Number(order.shipping_charges).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Badge variant="outline" className="w-full justify-center capitalize">
                  {order.order_status}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    'w-full justify-center',
                    order.payment_status === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-amber-500/10 text-amber-500'
                  )}
                >
                  Payment: {order.payment_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Farmer ID</p>
                <p className="font-medium">{order.farmer_id}</p>
              </div>
              {order.dealer_id && (
                <div>
                  <p className="text-sm text-muted-foreground">Assisted by Dealer</p>
                  <p className="font-medium">{order.dealer_id}</p>
                </div>
              )}
              {order.delivery_address && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
                  <div className="text-sm space-y-0.5">
                    <p>{(order.delivery_address as any).street}</p>
                    <p>
                      {(order.delivery_address as any).city},{' '}
                      {(order.delivery_address as any).state}
                    </p>
                    <p>{(order.delivery_address as any).postal_code}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Order Items */}
        <div className="space-y-6">
          <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems?.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{item.product_name}</p>
                      {item.product_sku && (
                        <p className="text-xs text-muted-foreground">SKU: {item.product_sku}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${Number(item.line_total).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Timeline & Actions */}
        <div className="space-y-6">
          <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusTimeline.map((step, index) => (
                  <div key={step.status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'h-8 w-8 rounded-full flex items-center justify-center transition-all',
                          step.completed
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      {index < statusTimeline.length - 1 && (
                        <div
                          className={cn(
                            'w-0.5 h-12 transition-all',
                            step.completed ? 'bg-primary' : 'bg-muted'
                          )}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p
                        className={cn(
                          'font-medium',
                          step.completed ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                      </p>
                      {step.time && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(step.time), 'PPp')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {delivery && (
            <Card className="backdrop-blur-sm bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Method</p>
                  <p className="font-medium capitalize">{delivery.delivery_method}</p>
                </div>
                {delivery.tracking_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-mono text-sm">{delivery.tracking_number}</p>
                  </div>
                )}
                {delivery.expected_delivery_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Delivery</p>
                    <p>{format(new Date(delivery.expected_delivery_date), 'PPP')}</p>
                  </div>
                )}
                <Badge variant="outline" className="w-full justify-center capitalize">
                  {delivery.delivery_status}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
