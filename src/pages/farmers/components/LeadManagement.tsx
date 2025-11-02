import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  UserPlus, Calendar, Phone, Mail, MapPin,
  TrendingUp, Clock, Target, Users, Filter
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const LeadManagement = () => {
  const [activeTab, setActiveTab] = useState('pipeline');

  // Sample lead data
  const leadStats = {
    totalLeads: 156,
    hotLeads: 23,
    qualified: 45,
    converted: 12,
    conversionRate: 18.5
  };

  const pipelineStages = [
    { name: 'New Leads', count: 45, color: 'bg-blue-500' },
    { name: 'Contacted', count: 32, color: 'bg-yellow-500' },
    { name: 'Qualified', count: 28, color: 'bg-orange-500' },
    { name: 'Proposal', count: 15, color: 'bg-purple-500' },
    { name: 'Converted', count: 12, color: 'bg-green-500' }
  ];

  const leads = [
    {
      id: '1',
      name: 'Rajesh Gupta',
      phone: '+91 9876543220',
      email: 'rajesh.gupta@example.com',
      location: 'Panipat, Haryana',
      landSize: 4.5,
      crops: ['Wheat', 'Mustard'],
      source: 'Website',
      stage: 'qualified',
      score: 85,
      lastContact: '2024-01-15',
      assignedTo: 'Agent 1',
      priority: 'high'
    },
    {
      id: '2',
      name: 'Sunita Devi',
      phone: '+91 9876543221',
      email: 'sunita.devi@example.com',
      location: 'Kurukshetra, Haryana',
      landSize: 2.8,
      crops: ['Rice', 'Vegetables'],
      source: 'Referral',
      stage: 'contacted',
      score: 72,
      lastContact: '2024-01-14',
      assignedTo: 'Agent 2',
      priority: 'medium'
    }
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'qualified': return 'default';
      case 'proposal': return 'secondary';
      case 'converted': return 'default';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Lead Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+15</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
            <Target className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{leadStats.hotLeads}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
            <UserPlus className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.qualified}</div>
            <p className="text-xs text-muted-foreground">
              Ready for conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{leadStats.converted}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+2.3%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">
            <Target className="h-4 w-4 mr-2" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Users className="h-4 w-4 mr-2" />
            Lead List
          </TabsTrigger>
          <TabsTrigger value="scoring">
            <TrendingUp className="h-4 w-4 mr-2" />
            Scoring
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                {pipelineStages.map((stage, index) => (
                  <div key={index} className="text-center">
                    <div className={`${stage.color} text-white rounded-lg p-4 mb-2`}>
                      <div className="text-2xl font-bold">{stage.count}</div>
                    </div>
                    <p className="text-sm font-medium">{stage.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lead Management</CardTitle>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger id="lead_stage_filter" className="w-32">
                      <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Lead
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{lead.name}</h3>
                        <Badge variant={getStageColor(lead.stage)}>
                          {lead.stage}
                        </Badge>
                        <Badge variant={getPriorityColor(lead.priority)}>
                          {lead.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {lead.location}
                        </span>
                        <span>{lead.landSize} acres</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {lead.crops.map(crop => (
                          <Badge key={crop} variant="secondary" className="text-xs">
                            {crop}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Score: {lead.score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lead.assignedTo}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last: {lead.lastContact}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Scoring Algorithm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Lead scoring configuration coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Lead analytics dashboard coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};