import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Target,
  Activity
} from 'lucide-react';

interface NDVIInsightsPanelProps {
  globalStats: any;
}

export const NDVIInsightsPanel: React.FC<NDVIInsightsPanelProps> = ({ globalStats }) => {
  const avgNDVI = globalStats?.average_ndvi;
  const hasData = avgNDVI !== undefined && avgNDVI !== null;
  
  // Generate insights based on data
  const insights = hasData ? [
    {
      type: avgNDVI > 0.6 ? 'success' : avgNDVI > 0.3 ? 'warning' : 'danger',
      title: avgNDVI > 0.6 
        ? 'Excellent Vegetation Health' 
        : avgNDVI > 0.3 
        ? 'Moderate Health - Monitor Closely'
        : 'Low Health - Action Needed',
      description: avgNDVI > 0.6
        ? 'Crops showing optimal health indicators. Maintain current practices.'
        : avgNDVI > 0.3
        ? 'Moderate vegetation index. Consider irrigation and soil analysis.'
        : 'Low vegetation health detected. Review crop management immediately.',
      action: avgNDVI > 0.6 ? 'View Trends' : 'Get Analysis',
      icon: avgNDVI > 0.6 ? CheckCircle2 : AlertCircle
    },
    {
      type: 'info',
      title: 'Optimize Resource Usage',
      description: 'Use NDVI data to make informed decisions about water, fertilizer, and pest management.',
      action: 'View Analytics',
      icon: TrendingUp
    },
    {
      type: 'info',
      title: 'Track Historical Patterns',
      description: 'Compare current health with past seasons to identify trends and make better planning decisions.',
      action: 'View Trends',
      icon: Target
    }
  ] : [
    {
      type: 'info',
      title: 'Start Vegetation Monitoring',
      description: 'Add farmers and land parcels to begin tracking vegetation health with satellite imagery.',
      action: 'Go to Farmers',
      icon: Target
    },
    {
      type: 'info',
      title: 'Request NDVI Data',
      description: 'Click "Queue NDVI & Refresh" to request the latest satellite data for your registered lands.',
      action: 'Learn More',
      icon: Sparkles
    },
    {
      type: 'info',
      title: 'View System Status',
      description: 'Check the System tab to monitor API health and processing queue status.',
      action: 'Check Status',
      icon: Activity
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {insights.map((insight, index) => {
        const Icon = insight.icon;
        const colors = {
          success: {
            bg: 'bg-green-500/10 dark:bg-green-500/20',
            border: 'border-green-500/20',
            text: 'text-green-700 dark:text-green-400',
            icon: 'text-green-600 dark:text-green-500'
          },
          warning: {
            bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
            border: 'border-yellow-500/20',
            text: 'text-yellow-700 dark:text-yellow-400',
            icon: 'text-yellow-600 dark:text-yellow-500'
          },
          danger: {
            bg: 'bg-red-500/10 dark:bg-red-500/20',
            border: 'border-red-500/20',
            text: 'text-red-700 dark:text-red-400',
            icon: 'text-red-600 dark:text-red-500'
          },
          info: {
            bg: 'bg-blue-500/10 dark:bg-blue-500/20',
            border: 'border-blue-500/20',
            text: 'text-blue-700 dark:text-blue-400',
            icon: 'text-blue-600 dark:text-blue-500'
          },
          marketing: {
            bg: 'bg-purple-500/10 dark:bg-purple-500/20',
            border: 'border-purple-500/20',
            text: 'text-purple-700 dark:text-purple-400',
            icon: 'text-purple-600 dark:text-purple-500'
          }
        };

        const colorScheme = colors[insight.type as keyof typeof colors];

        return (
          <Card 
            key={index}
            className={`relative overflow-hidden ${colorScheme.bg} ${colorScheme.border} border backdrop-blur-sm hover:shadow-lg transition-all duration-300 group`}
          >
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colorScheme.bg}`}>
                  <Icon className={`w-5 h-5 ${colorScheme.icon}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${colorScheme.text}`}>
                    {insight.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                variant="ghost" 
                size="sm"
                className={`w-full justify-between ${colorScheme.text} hover:${colorScheme.bg}`}
              >
                {insight.action}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <Lightbulb className="w-full h-full" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
