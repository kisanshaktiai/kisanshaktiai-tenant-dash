import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { SalesOrder } from '@/types/sales';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OrdersCalendarProps {
  orders: SalesOrder[];
  isLoading: boolean;
}

export function OrdersCalendar({ orders, isLoading }: OrdersCalendarProps) {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getOrdersForDay = (date: Date) => {
    return orders?.filter((order) => {
      const orderDate = new Date(order.confirmed_at || order.created_at);
      return isSameDay(orderDate, date);
    }) || [];
  };

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
            {day}
          </div>
        ))}

        {daysInMonth.map((date) => {
          const dayOrders = getOrdersForDay(date);
          const isToday = isSameDay(date, new Date());

          return (
            <Card
              key={date.toISOString()}
              className={`min-h-24 p-2 space-y-1 ${
                isToday ? 'border-primary ring-2 ring-primary/20' : ''
              } ${dayOrders.length > 0 ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                {format(date, 'd')}
              </div>

              {dayOrders.length > 0 && (
                <div className="space-y-1">
                  {dayOrders.slice(0, 2).map((order) => (
                    <div
                      key={order.id}
                      className="text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors truncate"
                      onClick={() => navigate(`/app/sales/${order.id}`)}
                    >
                      {order.order_number}
                    </div>
                  ))}
                  {dayOrders.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayOrders.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
