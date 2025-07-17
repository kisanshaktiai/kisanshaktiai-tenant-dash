import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, Award, Download } from 'lucide-react';

export const PerformanceTracking = () => {
  const [performanceData] = useState([
    {
      id: 'd1',
      dealer_name: 'Green Valley Seeds',
      period: 'Q1 2024',
      sales_target: 500000,
      sales_achieved: 475000,
      farmers_target: 200,
      farmers_acquired: 185,
      performance_score: 92,
      ranking: 1,
      commission_earned: 23750
    },
    {
      id: 'd2',
      dealer_name: 'Krishi Kendra',
      period: 'Q1 2024',
      sales_target: 300000,
      sales_achieved: 285000,
      farmers_target: 150,
      farmers_acquired: 142,
      performance_score: 88,
      ranking: 2,
      commission_earned: 14250
    }
  ]);

  const getRankingColor = (ranking: number) => {
    switch (ranking) {
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-gray-400';
      case 3: return 'bg-orange-600';
      default: return 'bg-muted';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Green Valley</div>
            <p className="text-xs text-muted-foreground">
              95% target achievement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹38,000</div>
            <p className="text-xs text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dealers</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              100% participation rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dealer Performance Leaderboard</CardTitle>
              <CardDescription>
                Current quarter performance metrics and rankings
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((dealer) => (
              <div key={dealer.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className={`w-8 h-8 rounded-full ${getRankingColor(dealer.ranking)} flex items-center justify-center text-white font-bold text-sm`}>
                  {dealer.ranking}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{dealer.dealer_name}</h3>
                  <p className="text-sm text-muted-foreground">{dealer.period}</p>
                </div>
                
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <p className="text-sm font-medium">Sales Achievement</p>
                    <p className="text-lg font-bold">
                      {Math.round((dealer.sales_achieved / dealer.sales_target) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{(dealer.sales_achieved / 100000).toFixed(1)}L / ₹{(dealer.sales_target / 100000).toFixed(1)}L
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Farmer Acquisition</p>
                    <p className="text-lg font-bold">
                      {Math.round((dealer.farmers_acquired / dealer.farmers_target) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dealer.farmers_acquired} / {dealer.farmers_target}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Performance Score</p>
                    <p className={`text-lg font-bold ${getPerformanceColor(dealer.performance_score)}`}>
                      {dealer.performance_score}
                    </p>
                    <p className="text-xs text-muted-foreground">Out of 100</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Commission Earned</p>
                    <p className="text-lg font-bold text-green-600">
                      ₹{dealer.commission_earned.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">This quarter</p>
                  </div>
                </div>
                
                <Badge variant="outline">
                  View Details
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>
            Quarterly performance comparison and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Performance charts will be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};