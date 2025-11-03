import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAIInsights } from '@/hooks/organization/useAIInsights';
import { Sparkles, TrendingUp, Shield, DollarSign, Users, CheckCircle, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const AIInsightsPanel = () => {
  const { insights, unresolvedInsights, isLoading, resolveInsight, generateInsights, isGenerating } =
    useAIInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <TrendingUp className="h-4 w-4" />;
      case 'cost':
        return <DollarSign className="h-4 w-4" />;
      case 'engagement':
        return <Users className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              {unresolvedInsights.length} active recommendations for your organization
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateInsights()}
            disabled={isGenerating}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Generate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {insights && insights.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No insights available yet</p>
                <Button onClick={() => generateInsights()} disabled={isGenerating}>
                  Generate Insights
                </Button>
              </div>
            ) : (
              insights?.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border transition-all ${
                    insight.is_resolved ? 'opacity-50 bg-muted/30' : 'bg-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(insight.priority)}`}>
                      {getInsightIcon(insight.insight_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      {insight.recommendation && (
                        <div className="mt-2 p-3 rounded-md bg-primary/5 border border-primary/10">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold">Recommendation:</span> {insight.recommendation}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            Impact: {insight.impact_score}/100
                          </Badge>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {insight.insight_type}
                          </Badge>
                        </div>
                        {!insight.is_resolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resolveInsight(insight.id)}
                            className="gap-2 h-8"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
