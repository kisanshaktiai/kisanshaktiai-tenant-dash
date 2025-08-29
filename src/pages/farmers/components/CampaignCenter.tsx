
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, Play, Pause, BarChart3, MessageSquare, 
  Users, Calendar, Target, Send, Settings 
} from 'lucide-react';

export const CampaignCenter: React.FC = () => {
  const [campaigns] = useState([
    {
      id: '1',
      name: 'Winter Crop Advisory',
      type: 'Educational',
      status: 'active',
      targetAudience: 2500,
      reached: 2100,
      engagement: 78,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      channels: ['SMS', 'WhatsApp', 'App'],
      progress: 84
    },
    {
      id: '2',
      name: 'New Product Launch',
      type: 'Promotional',
      status: 'scheduled',
      targetAudience: 1800,
      reached: 0,
      engagement: 0,
      startDate: '2024-02-01',
      endDate: '2024-02-28',
      channels: ['WhatsApp', 'App', 'Voice'],
      progress: 0
    },
    {
      id: '3',
      name: 'Government Scheme Alert',
      type: 'Government',
      status: 'completed',
      targetAudience: 3200,
      reached: 3180,
      engagement: 65,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      channels: ['SMS', 'Voice'],
      progress: 100
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Educational': return 'default';
      case 'Promotional': return 'secondary';
      case 'Government': return 'outline';
      case 'Seasonal': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Campaign Center</h2>
          <p className="text-muted-foreground">Manage and track your farmer engagement campaigns</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Farmers Reached</p>
                <p className="text-2xl font-bold">18.5K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Engagement</p>
                <p className="text-2xl font-bold">74%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Send className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages Sent</p>
                <p className="text-2xl font-bold">156K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Campaigns</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {campaigns.filter(c => c.status === 'active').map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {campaign.name}
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(campaign.status)}`} />
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getTypeColor(campaign.type)}>{campaign.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {campaign.startDate} - {campaign.endDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Target Audience</p>
                      <p className="text-2xl font-bold">{campaign.targetAudience.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Reached</p>
                      <p className="text-2xl font-bold">{campaign.reached.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((campaign.reached / campaign.targetAudience) * 100)}% of target
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Engagement Rate</p>
                      <p className="text-2xl font-bold">{campaign.engagement}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Progress</p>
                      <Progress value={campaign.progress} className="mt-2" />
                      <p className="text-sm text-muted-foreground mt-1">{campaign.progress}% complete</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Channels</p>
                    <div className="flex gap-2">
                      {campaign.channels.map((channel, index) => (
                        <Badge key={index} variant="outline">
                          {channel === 'SMS' && <MessageSquare className="h-3 w-3 mr-1" />}
                          {channel === 'WhatsApp' && <MessageSquare className="h-3 w-3 mr-1" />}
                          {channel === 'App' && <Target className="h-3 w-3 mr-1" />}
                          {channel === 'Voice' && <Users className="h-3 w-3 mr-1" />}
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="grid gap-4">
            {campaigns.filter(c => c.status === 'scheduled').map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {campaign.name}
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(campaign.status)}`} />
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getTypeColor(campaign.type)}>{campaign.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Starts: {campaign.startDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4" />
                        Start Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium">Target Audience</p>
                      <p className="text-2xl font-bold">{campaign.targetAudience.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-lg font-medium">{campaign.startDate} - {campaign.endDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Channels</p>
                      <div className="flex gap-1 flex-wrap">
                        {campaign.channels.map((channel, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {campaigns.filter(c => c.status === 'completed').map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {campaign.name}
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(campaign.status)}`} />
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getTypeColor(campaign.type)}>{campaign.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Completed: {campaign.endDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                        View Report
                      </Button>
                      <Button variant="outline" size="sm">
                        Duplicate
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Target Audience</p>
                      <p className="text-2xl font-bold">{campaign.targetAudience.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Reached</p>
                      <p className="text-2xl font-bold text-green-600">{campaign.reached.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((campaign.reached / campaign.targetAudience) * 100)}% reach rate
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Engagement Rate</p>
                      <p className="text-2xl font-bold text-blue-600">{campaign.engagement}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Success Rate</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.round((campaign.reached / campaign.targetAudience) * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Seasonal Advisory', type: 'Educational', description: 'Weather-based crop recommendations' },
              { name: 'Product Promotion', type: 'Promotional', description: 'New product launches and offers' },
              { name: 'Government Schemes', type: 'Government', description: 'Policy updates and scheme announcements' },
              { name: 'Training Programs', type: 'Educational', description: 'Skill development and training' },
              { name: 'Market Updates', type: 'Informational', description: 'Price trends and market news' },
              { name: 'Weather Alerts', type: 'Alert', description: 'Weather warnings and advisories' }
            ].map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant={getTypeColor(template.type)} className="w-fit">
                    {template.type}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm">Use Template</Button>
                    <Button variant="outline" size="sm">Preview</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
