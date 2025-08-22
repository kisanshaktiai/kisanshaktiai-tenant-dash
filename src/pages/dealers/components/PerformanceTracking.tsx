
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Target, Users, DollarSign, Star } from 'lucide-react';
import { useDealerPerformanceQuery } from '@/hooks/data/useDealerNetworkQuery';

export const PerformanceTracking: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedDealer, setSelectedDealer] = useState<string>('all');

  const { data: performanceData, isLoading } = useDealerPerformanceQuery({
    period: selectedPeriod,
    dealer_id: selectedDealer !== 'all' ? selectedDealer : undefined,
  });

  const performances = performanceData?.data || [];

  const topPerformers = performances
    .sort((a, b) => b.performance_score - a.performance_score)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const averagePerformance = performances.length > 0 
    ? performances.reduce((sum, p) => sum + p.performance_score, 0) / performances.length 
    : 0;

  const totalSalesAchieved = performances.reduce((sum, p) => sum + p.sales_achieved, 0);
  const totalSalesTarget = performances.reduce((sum, p) => sum + p.sales_target, 0);
  const salesAchievementRate = totalSalesTarget > 0 ? (totalSalesAchieved / totalSalesTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Tracking</h2>
          <p className="text-muted-foreground">
            Monitor dealer performance and achievements
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Performance Score
                </p>
                <p className="text-2xl font-bold">{averagePerformance.toFixed(1)}</p>
                <p className="text-xs text-green-600">
                  +5.2% from last period
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sales Achievement
                </p>
                <p className="text-2xl font-bold">{salesAchievementRate.toFixed(1)}%</p>
                <p className="text-xs text-green-600">
                  +3.1% from target
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">₹{(totalSalesAchieved / 100000).toFixed(1)}L</p>
                <p className="text-xs text-green-600">
                  +8.7% growth
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Dealers
                </p>
                <p className="text-2xl font-bold">{performances.length}</p>
                <p className="text-xs text-blue-600">
                  97% active rate
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performance, index) => (
              <div key={performance.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{performance.dealer?.business_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {performance.dealer?.contact_person}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Performance Score</p>
                    <p className="font-semibold">{performance.performance_score.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Sales Achievement</p>
                    <p className="font-semibold">
                      {((performance.sales_achieved / performance.sales_target) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Commission</p>
                    <p className="font-semibold">₹{performance.commission_earned.toLocaleString()}</p>
                  </div>
                  <Badge variant={performance.performance_score >= 80 ? 'default' : 'secondary'}>
                    {performance.performance_score >= 90 ? 'Excellent' : 
                     performance.performance_score >= 80 ? 'Good' : 
                     performance.performance_score >= 60 ? 'Average' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {topPerformers.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No performance data available</h3>
              <p className="text-muted-foreground">
                Performance data will appear here once dealers start reporting their metrics.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
