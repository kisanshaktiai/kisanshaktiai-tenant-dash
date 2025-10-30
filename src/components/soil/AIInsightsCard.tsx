import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateSoilInsights, generateSoilSummary, SoilInsight } from '@/utils/soilInsights';
import { Lightbulb, TrendingUp } from 'lucide-react';

interface AIInsightsCardProps {
  soilData: {
    ph_level?: number | null;
    organic_carbon?: number | null;
    bulk_density?: number | null;
    nitrogen_level?: string | null;
    phosphorus_level?: string | null;
    potassium_level?: string | null;
    soil_type?: string | null;
  };
}

export function AIInsightsCard({ soilData }: AIInsightsCardProps) {
  const insights = generateSoilInsights(soilData);
  const summary = generateSoilSummary(soilData);

  const getSeverityColor = (severity: SoilInsight['severity']) => {
    switch (severity) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>AI Soil Summary</CardTitle>
          </div>
          <CardDescription>
            Comprehensive analysis of soil condition and fertility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">{summary}</p>
        </CardContent>
      </Card>

      {/* Detailed Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Parameter Analysis & Recommendations</h3>
        </div>

        {insights.map((insight, index) => (
          <Card key={index} className={`border ${getSeverityColor(insight.severity)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <CardTitle className="text-base">
                      {insight.parameter}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {insight.condition}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">{insight.message}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Recommendations */}
              {insight.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">📋 Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {insight.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Crop Suitability */}
              {insight.cropSuitability.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">🌾 Suitable Crops:</h4>
                  <div className="flex flex-wrap gap-2">
                    {insight.cropSuitability.map((crop, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
