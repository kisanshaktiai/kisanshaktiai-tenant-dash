
import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Megaphone, Calendar, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PermissionGuard } from '@/components/guards/PermissionGuard';

interface Campaign {
  id: string;
  name: string;
  type: 'promotional' | 'educational' | 'seasonal' | 'government_scheme';
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  targetAudience: number;
  reached: number;
  budget: number;
  spent: number;
  channels: string[];
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Fertilizer Campaign',
    type: 'promotional',
    status: 'active',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    targetAudience: 5000,
    reached: 3200,
    budget: 50000,
    spent: 32000,
    channels: ['SMS', 'WhatsApp', 'App']
  },
  {
    id: '2',
    name: 'Organic Farming Workshop Series',
    type: 'educational',
    status: 'active',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    targetAudience: 1500,
    reached: 890,
    budget: 25000,
    spent: 15600,
    channels: ['App', 'Email']
  }
];

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [campaigns] = useState<Campaign[]>(mockCampaigns);

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-gray-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: Campaign['type']) => {
    switch (type) {
      case 'promotional': return 'bg-purple-500';
      case 'educational': return 'bg-blue-500';
      case 'seasonal': return 'bg-orange-500';
      case 'government_scheme': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-8 w-8" />
            Campaign Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage promotional and educational campaigns
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
          <PermissionGuard permission="campaigns.create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter(c => c.status === 'draft').length} drafts pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.reached, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaigns.reduce((sum, c) => sum + c.targetAudience, 0).toLocaleString()} target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((campaigns.reduce((sum, c) => sum + c.spent, 0) / campaigns.reduce((sum, c) => sum + c.budget, 0)) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              ₹{campaigns.reduce((sum, c) => sum + c.spent, 0).toLocaleString()} spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Campaigns launched
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns by name, type, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">All Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="audiences">Audiences</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold">{campaign.name}</h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={`${getTypeColor(campaign.type)} text-white`}>
                            {campaign.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                            {campaign.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Reach</div>
                      <div className="text-lg font-semibold">
                        {campaign.reached.toLocaleString()} / {campaign.targetAudience.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Budget: ₹{campaign.spent.toLocaleString()} / ₹{campaign.budget.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Channels:</span>
                        {campaign.channels.map((channel) => (
                          <Badge key={channel} variant="outline">{channel}</Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <PermissionGuard permission="campaigns.view">
                          <Button variant="outline" size="sm">View Details</Button>
                        </PermissionGuard>
                        <PermissionGuard permission="campaigns.edit">
                          <Button variant="outline" size="sm">Edit</Button>
                        </PermissionGuard>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed campaign performance analytics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Pre-built campaign templates for quick setup.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audiences">
          <Card>
            <CardHeader>
              <CardTitle>Target Audiences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage and segment your target audiences.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
