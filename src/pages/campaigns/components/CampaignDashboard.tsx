
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, Users, MessageSquare, DollarSign, 
  Target, BarChart3, Clock, CheckCircle 
} from 'lucide-react';
import { useCampaignStatsQuery } from '@/hooks/data/useCampaignsQuery';

export const CampaignDashboard = () => {
  const { data: stats, isLoading } = useCampaignStatsQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-8 bg-muted rounded w-16"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Campaigns',
      value: stats?.total_campaigns || 0,
      change: '+12%',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      title: 'Active Campaigns',
      value: stats?.active_campaigns || 0,
      change: '+3',
      icon: Clock,
      color: 'text-green-600'
    },
    {
      title: 'Total Reach',
      value: '24.5K',
      change: '+8.2%',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Engagement Rate',
      value: '18.4%',
      change: '+2.1%',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{metric.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Last 30 days overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Open Rate</span>
                  <span>24.5%</span>
                </div>
                <Progress value={24.5} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Click Rate</span>
                  <span>8.2%</span>
                </div>
                <Progress value={8.2} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Conversion Rate</span>
                  <span>3.1%</span>
                </div>
                <Progress value={3.1} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Campaign Activity</CardTitle>
            <CardDescription>Latest updates and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Summer Sale Campaign</p>
                  <p className="text-xs text-muted-foreground">Completed successfully - 2,845 farmers reached</p>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Kharif Season Tips</p>
                  <p className="text-xs text-muted-foreground">Running - 1,245 messages sent</p>
                </div>
                <Badge>Active</Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New Product Launch</p>
                  <p className="text-xs text-muted-foreground">Scheduled for tomorrow</p>
                </div>
                <Badge variant="outline">Scheduled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
          <CardDescription>Engagement rates by communication channel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { channel: 'WhatsApp', rate: '32.4%', icon: MessageSquare, color: 'text-green-600' },
              { channel: 'SMS', rate: '18.7%', icon: MessageSquare, color: 'text-blue-600' },
              { channel: 'Email', rate: '12.3%', icon: MessageSquare, color: 'text-purple-600' },
              { channel: 'App Push', rate: '8.9%', icon: MessageSquare, color: 'text-orange-600' }
            ].map((item) => (
              <div key={item.channel} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-sm font-medium">{item.channel}</span>
                </div>
                <span className="text-sm font-bold">{item.rate}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
