
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

export const FarmerPipeline = () => {
  const [activeTab, setActiveTab] = useState('pipeline');

  // Sample farmer pipeline data
  const pipelineStats = {
    totalFarmers: 1250,
    activeFarmers: 980,
    newFarmers: 45,
    verifiedFarmers: 890,
    engagementRate: 78.5
  };

  const pipelineStages = [
    { name: 'New Registrations', count: 45, color: 'bg-blue-500' },
    { name: 'Verification Pending', count: 32, color: 'bg-yellow-500' },
    { name: 'Verified', count: 28, color: 'bg-orange-500' },
    { name: 'Active', count: 980, color: 'bg-purple-500' },
    { name: 'Premium', count: 120, color: 'bg-green-500' }
  ];

  const farmers = [
    {
      id: '1',
      name: 'Rajesh Gupta',
      phone: '+91 9876543220',
      email: 'rajesh.gupta@example.com',
      location: 'Panipat, Haryana',
      landSize: 4.5,
      crops: ['Wheat', 'Mustard'],
      source: 'Mobile App',
      stage: 'verified',
      score: 85,
      lastActive: '2024-01-15',
      registrationDate: '2024-01-10',
      status: 'active'
    },
    {
      id: '2',
      name: 'Sunita Devi',
      phone: '+91 9876543221',
      email: 'sunita.devi@example.com',
      location: 'Kurukshetra, Haryana',
      landSize: 2.8,
      crops: ['Rice', 'Vegetables'],
      source: 'Dealer Referral',
      stage: 'pending_verification',
      score: 72,
      lastActive: '2024-01-14',
      registrationDate: '2024-01-12',
      status: 'pending'
    }
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return 'default';
      case 'pending_verification': return 'secondary';
      case 'verified': return 'default';
      case 'active': return 'secondary';
      case 'premium': return 'default';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'inactive': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineStats.totalFarmers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+{pipelineStats.newFarmers}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Farmers</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pipelineStats.activeFarmers}</div>
            <p className="text-xs text-muted-foreground">
              Actively using platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineStats.newFarmers}</div>
            <p className="text-xs text-muted-foreground">
              New registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pipelineStats.verifiedFarmers}</div>
            <p className="text-xs text-muted-foreground">
              Completed verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineStats.engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+5.2%</span> from last month
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
          <TabsTrigger value="farmers">
            <Users className="h-4 w-4 mr-2" />
            Farmer List
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <TrendingUp className="h-4 w-4 mr-2" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Farmer Pipeline</CardTitle>
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

        <TabsContent value="farmers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Farmer Management</CardTitle>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Farmer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {farmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {farmer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{farmer.name}</h3>
                        <Badge variant={getStageColor(farmer.stage)}>
                          {farmer.stage.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getStatusColor(farmer.status)}>
                          {farmer.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {farmer.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {farmer.location}
                        </span>
                        <span>{farmer.landSize} acres</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {farmer.crops.map(crop => (
                          <Badge key={crop} variant="secondary" className="text-xs">
                            {crop}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Score: {farmer.score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Registered: {farmer.registrationDate}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last active: {farmer.lastActive}
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

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Farmer Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Farmer engagement analytics coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Farmer Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Farmer analytics dashboard coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
