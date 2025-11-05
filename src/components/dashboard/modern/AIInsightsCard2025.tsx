import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import type { AIInsight } from '@/services/EnhancedDashboardService';
import { cn } from '@/lib/utils';

interface AIInsightsCard2025Props {
  insights: AIInsight[];
}

const priorityConfig = {
  high: {
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: AlertCircle,
  },
  medium: {
    color: 'bg-warning/10 text-warning border-warning/20',
    icon: TrendingUp,
  },
  low: {
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: Lightbulb,
  },
};

export const AIInsightsCard2025: React.FC<AIInsightsCard2025Props> = ({ insights }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg font-semibold">AI Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No insights available at the moment
            </p>
          ) : (
            insights.map((insight) => {
              const config = priorityConfig[insight.priority];
              const Icon = config.icon;

              return (
                <div
                  key={insight.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all duration-200',
                    'hover:shadow-md bg-gradient-to-br from-card to-muted/10'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg', config.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{insight.title}</h4>
                        <Badge variant="outline" className={cn('text-xs', config.color)}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-primary/20 hover:bg-primary/10"
                        >
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
