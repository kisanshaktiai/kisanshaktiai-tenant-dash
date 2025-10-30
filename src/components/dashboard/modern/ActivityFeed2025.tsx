import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Package, MapPin, Building, Zap, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { RecentActivity } from '@/services/EnhancedDashboardService';
import { cn } from '@/lib/utils';

interface ActivityFeed2025Props {
  activities: RecentActivity[];
  isLive?: boolean;
}

const iconMap = {
  User,
  Package,
  MapPin,
  Building,
  Zap,
  AlertTriangle,
};

const colorMap = {
  success: 'text-success bg-success/10',
  primary: 'text-primary bg-primary/10',
  warning: 'text-warning bg-warning/10',
  destructive: 'text-destructive bg-destructive/10',
  info: 'text-info bg-info/10',
};

export const ActivityFeed2025: React.FC<ActivityFeed2025Props> = ({
  activities,
  isLive,
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success font-medium">Live Updates</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent activity to display
              </p>
            ) : (
              activities.map((activity) => {
                const Icon = iconMap[activity.icon as keyof typeof iconMap] || User;
                const colorClass = colorMap[activity.color as keyof typeof colorMap] || colorMap.primary;

                return (
                  <div
                    key={activity.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg transition-all duration-200',
                      'hover:bg-muted/50 border border-transparent hover:border-border'
                    )}
                  >
                    <div className={cn('p-2 rounded-lg', colorClass)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
