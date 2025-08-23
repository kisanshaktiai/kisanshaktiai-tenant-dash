
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Target, Users, Calendar, Award, Eye, Download } from 'lucide-react';

export const PerformanceTracking: React.FC = () => {
  // Mock performance data
  const performanceData = [
    {
      id: '1',
      dealer: {
        business_name: 'Green Valley Suppliers',
        contact_person: 'Rajesh Kumar',
      },
      period: 'Q1 2024',
      sales_target: 500000,
      sales_achieved: 425000,
      farmers_target: 100,
      farmers_acquired: 85,
      performance_score: 85,
      ranking: 1,
      response_time_avg: 2.5,
      customer_satisfaction_score: 4.2,
      commission_earned: 42500,
      achievements: ['Top Performer', 'Customer Champion'],
      improvement_areas: ['Response Time'],
    },
    {
      id: '2',
      dealer: {
        business_name: 'Sunrise Agro Center',
        contact_person: 'Priya Sharma',
      },
      period: 'Q1 2024',
      sales_target: 400000,
      sales_achieved: 380000,
      farmers_target: 80,
      farmers_acquired: 78,
      performance_score: 95,
      ranking: 2,
      response_time_avg: 1.8,
      customer_satisfaction_score: 4.6,
      commission_earned: 38000,
      achievements: ['Fastest Response', 'Quality Leader'],
      improvement_areas: [],
    },
    {
      id: '3',
      dealer: {
        business_name: 'Modern Farm Solutions',
        contact_person: 'Amit Patel',
      },
      period: 'Q1 2024',
      sales_target: 300000,
      sales_achieved: 180000,
      farmers_target: 60,
      farmers_acquired: 35,
      performance_score: 60,
      ranking: 3,
      response_time_avg: 4.2,
      customer_satisfaction_score: 3.8,
      commission_earned: 18000,
      achievements: [],
      improvement_areas: ['Sales Performance', 'Farmer Acquisition', 'Response Time'],
    },
  ];

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 75) return <Badge variant="default" className="bg-blue-100 text-blue-800">Good</Badge>;
    if (score >= 60) return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Average</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  const getRankingIcon = (ranking: number) => {
    switch (ranking) {
      case 1:
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Award className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <div className="h-5 w-5" />;
    }
  };

  const calculateSalesPercentage = (achieved: number, target: number) => {
    return Math.round((achieved / target) * 100);
  };

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
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Change Period
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">₹9.85L</p>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-xs text-green-600">+12% vs target</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">198</p>
                <p className="text-sm text-muted-foreground">Farmers Acquired</p>
                <p className="text-xs text-blue-600">82% of target</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">80.0</p>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
                <p className="text-xs text-purple-600">Good</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">4.2</p>
                <p className="text-sm text-muted-foreground">Satisfaction Score</p>
                <p className="text-xs text-yellow-600">Out of 5.0</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Cards */}
          <div className="grid gap-6">
            {performanceData.map((performance) => (
              <Card key={performance.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getRankingIcon(performance.ranking)}
                      <div>
                        <CardTitle className="text-lg">{performance.dealer.business_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {performance.dealer.contact_person} • {performance.period}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getPerformanceBadge(performance.performance_score)}
                      <span className="text-lg font-bold">#{performance.ranking}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Sales Performance */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Sales Performance</span>
                      <span className="text-sm text-muted-foreground">
                        ₹{(performance.sales_achieved / 100000).toFixed(1)}L / ₹{(performance.sales_target / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <Progress 
                      value={calculateSalesPercentage(performance.sales_achieved, performance.sales_target)} 
                      className="h-2"
                    />
                  </div>

                  {/* Farmer Acquisition */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Farmer Acquisition</span>
                      <span className="text-sm text-muted-foreground">
                        {performance.farmers_acquired} / {performance.farmers_target}
                      </span>
                    </div>
                    <Progress 
                      value={calculateSalesPercentage(performance.farmers_acquired, performance.farmers_target)} 
                      className="h-2"
                    />
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-lg font-bold">{performance.response_time_avg}h</p>
                      <p className="text-xs text-muted-foreground">Avg Response Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{performance.customer_satisfaction_score}/5</p>
                      <p className="text-xs text-muted-foreground">Satisfaction</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">₹{(performance.commission_earned / 1000).toFixed(1)}K</p>
                      <p className="text-xs text-muted-foreground">Commission</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{performance.performance_score}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>

                  {/* Achievements & Improvements */}
                  {(performance.achievements.length > 0 || performance.improvement_areas.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                      {performance.achievements.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-green-600 mb-2">Achievements</p>
                          <div className="flex flex-wrap gap-1">
                            {performance.achievements.map((achievement, index) => (
                              <Badge key={index} variant="default" className="bg-green-100 text-green-800 text-xs">
                                {achievement}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {performance.improvement_areas.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-yellow-600 mb-2">Improvement Areas</p>
                          <div className="flex flex-wrap gap-1">
                            {performance.improvement_areas.map((area, index) => (
                              <Badge key={index} variant="default" className="bg-yellow-100 text-yellow-800 text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Performance Review
                    </Button>
                    {performance.performance_score < 75 && (
                      <Button size="sm">
                        Action Plan
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="detailed">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Detailed performance metrics view coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="rankings">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Dealer rankings and leaderboard coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
