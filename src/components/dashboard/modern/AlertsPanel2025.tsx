import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import type { SystemAlert } from '@/services/EnhancedDashboardService';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AlertsPanel2025Props {
  alerts: SystemAlert[];
}

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    color: 'bg-destructive/10 text-destructive border-destructive/30',
    badge: 'bg-destructive text-destructive-foreground',
  },
  warning: {
    icon: AlertCircle,
    color: 'bg-warning/10 text-warning border-warning/30',
    badge: 'bg-warning text-warning-foreground',
  },
  info: {
    icon: Info,
    color: 'bg-primary/10 text-primary border-primary/30',
    badge: 'bg-primary text-primary-foreground',
  },
};

export const AlertsPanel2025: React.FC<AlertsPanel2025Props> = ({ alerts }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(alertId));
  };

  const visibleAlerts = alerts.filter((alert) => !dismissedAlerts.has(alert.id));
  const criticalCount = visibleAlerts.filter((a) => a.type === 'critical').length;

  if (visibleAlerts.length === 0) return null;

  return (
    <Card className="border-t-4 border-t-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">System Alerts</h3>
            {criticalCount > 0 && (
              <Badge className={alertConfig.critical.badge}>
                {criticalCount} Critical
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {visibleAlerts.map((alert) => {
            const config = alertConfig[alert.type];
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-all',
                  config.color
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{alert.title}</h4>
                  <p className="text-xs opacity-90 mt-1">{alert.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-background/50"
                  onClick={() => handleDismiss(alert.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
