import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import type { OrderFilters, OrderStatus, PaymentStatus } from '@/types/sales';

interface SalesFiltersProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
}

const orderStatuses: OrderStatus[] = [
  'draft',
  'pending',
  'confirmed',
  'processing',
  'fulfilled',
  'delivered',
  'cancelled',
  'returned',
];

const paymentStatuses: PaymentStatus[] = ['pending', 'partial', 'paid', 'refunded', 'failed'];

export function SalesFilters({ filters, onFiltersChange }: SalesFiltersProps) {
  const toggleOrderStatus = (status: OrderStatus) => {
    const current = filters.order_status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFiltersChange({ ...filters, order_status: updated });
  };

  const togglePaymentStatus = (status: PaymentStatus) => {
    const current = filters.payment_status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFiltersChange({ ...filters, payment_status: updated });
  };

  const activeFiltersCount =
    (filters.order_status?.length || 0) + (filters.payment_status?.length || 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Order Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orderStatuses.map((status) => (
          <DropdownMenuCheckboxItem
            key={status}
            checked={filters.order_status?.includes(status)}
            onCheckedChange={() => toggleOrderStatus(status)}
            className="capitalize"
          >
            {status}
          </DropdownMenuCheckboxItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {paymentStatuses.map((status) => (
          <DropdownMenuCheckboxItem
            key={status}
            checked={filters.payment_status?.includes(status)}
            onCheckedChange={() => togglePaymentStatus(status)}
            className="capitalize"
          >
            {status}
          </DropdownMenuCheckboxItem>
        ))}

        {activeFiltersCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => onFiltersChange({})}
            >
              Clear Filters
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
