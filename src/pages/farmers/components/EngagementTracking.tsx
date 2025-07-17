import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Users, MessageSquare, Eye, 
  Calendar, Phone, Mail, Activity
} from 'lucide-react';

export const EngagementTracking = () => {
  // Sample engagement data
  const engagementStats = {
    activeUsers: 1892,
    avgSessionTime: '8.5 min',
    featureAdoption: 73.2,
    responseRate: 68.5,
    churnRate: 4.8,
    npsScore: 8.2
  };

  const topFeatures = [
    { name: 'Weather Updates', usage: 94.2, trend: 'up' },
    { name: 'Crop Advisory', usage: 87.5, trend: 'up' },
    { name: 'Market Prices', usage: 82.1, trend: 'down' },
    { name: 'Product Catalog', usage: 76.8, trend: 'up' },
    { name: 'Community Forum', usage: 45.3, trend: 'stable' }
  ];

  const recentEngagement = [
    { farmer: 'Ramesh Kumar', activity: 'Viewed crop advisory', time: '2 hours ago', score: 85 },
    { farmer: 'Priya Sharma', activity: 'Completed survey', time: '4 hours ago', score: 72 },
    { farmer: 'Suresh Patel', activity: 'Downloaded report', time: '6 hours ago', score: 45 },
    { farmer: 'Maya Singh', activity: 'Attended webinar', time: '1 day ago', score: 91 }
  ];

  return (
    <div className="space-y-6">
      {/* Engagement Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (30d)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementStats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementStats.avgSessionTime}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+0.8 min</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feature Adoption</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementStats.featureAdoption}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+5.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementStats.responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+3.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Users className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{engagementStats.churnRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">-0.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{engagementStats.npsScore}/10</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+0.4</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Features */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="font-medium">{feature.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{feature.usage}%</span>
                    <Badge variant={feature.trend === 'up' ? 'default' : 
                                  feature.trend === 'down' ? 'destructive' : 'secondary'}>
                      {feature.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEngagement.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.farmer}</p>
                    <p className="text-sm text-muted-foreground">{item.activity}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Score: {item.score}</div>
                    <Badge variant={item.score >= 80 ? 'default' : 
                                  item.score >= 60 ? 'secondary' : 'destructive'}>
                      {item.score >= 80 ? 'High' : item.score >= 60 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Detailed engagement analytics chart coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};