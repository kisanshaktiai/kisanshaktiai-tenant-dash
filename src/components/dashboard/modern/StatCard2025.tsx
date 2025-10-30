import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatCard2025Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  isLive?: boolean;
  className?: string;
}

export const StatCard2025: React.FC<StatCard2025Props> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isLive,
  className,
}) => {
  const isPositiveTrend = trend && trend.value > 0;
  const isNegativeTrend = trend && trend.value < 0;

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:scale-[1.02]',
        'bg-gradient-to-br from-card/95 to-card/80',
        'border-border/50 hover:border-primary/30',
        className
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {isLive && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs text-success">Live</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Value */}
        <div className="mb-3">
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {/* Trend */}
        {trend && (
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              isPositiveTrend && 'bg-success/10 text-success border-success/20',
              isNegativeTrend && 'bg-destructive/10 text-destructive border-destructive/20',
              !isPositiveTrend && !isNegativeTrend && 'bg-muted/10 text-muted-foreground border-muted/20'
            )}
          >
            {isPositiveTrend && '↑ '}
            {isNegativeTrend && '↓ '}
            {Math.abs(trend.value)}% {trend.label}
          </Badge>
        )}
      </CardContent>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
    </Card>
  );
};
