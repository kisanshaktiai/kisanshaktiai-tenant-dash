import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, MapPin, Phone, Mail, Calendar, Edit, 
  MessageSquare, Sprout, TrendingUp, History,
  Package, Users, FileText, AlertTriangle
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface FarmerProfileProps {
  farmer: any;
  onClose: () => void;
}

export const FarmerProfile = ({ farmer, onClose }: FarmerProfileProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample detailed farmer data
  const farmerDetails = {
    ...farmer,
    joinDate: '2023-03-15',
    lastLogin: '2024-01-15 10:30 AM',
    totalOrders: 23,
    totalSpent: 45600,
    lands: [
      { id: '1', name: 'Main Field', size: 3.2, crop: 'Wheat', status: 'Harvested' },
      { id: '2', name: 'Back Field', size: 2.0, crop: 'Rice', status: 'Growing' }
    ],
    recentActivity: [
      { date: '2024-01-15', activity: 'Viewed crop advisory', type: 'app_usage' },
      { date: '2024-01-14', activity: 'Ordered fertilizer', type: 'purchase' },
      { date: '2024-01-13', activity: 'Attended webinar', type: 'engagement' }
    ],
    communications: [
      { date: '2024-01-12', type: 'SMS', message: 'Weather alert sent', status: 'delivered' },
      { date: '2024-01-10', type: 'Call', message: 'Follow-up call completed', status: 'completed' },
      { date: '2024-01-08', type: 'Email', message: 'Newsletter sent', status: 'opened' }
    ]
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-4xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={farmer.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {farmer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-2xl">{farmer.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {farmer.village}, {farmer.district}, {farmer.state}
                </span>
                <Badge variant={farmer.status === 'active' ? 'default' : 'destructive'}>
                  {farmer.status}
                </Badge>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button size="sm" variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button size="sm" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="lands">Lands</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{farmer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{farmer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined: {farmerDetails.joinDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>Last active: {farmerDetails.lastLogin}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Farming Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sprout className="h-4 w-4 text-muted-foreground" />
                      <span>Total Land: {farmer.landSize} acres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>Primary Crops: {farmer.crops.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>Engagement Score: {farmer.engagementScore}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Churn Risk: </span>
                      <Badge variant={farmer.churnRisk === 'low' ? 'default' : 
                                    farmer.churnRisk === 'medium' ? 'secondary' : 'destructive'}>
                        {farmer.churnRisk}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {farmerDetails.totalOrders}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        ₹{farmerDetails.totalSpent.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {farmerDetails.lands.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Land Parcels</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {farmer.engagementScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Engagement</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {farmerDetails.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.activity}</p>
                          <p className="text-xs text-muted-foreground">{activity.date}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lands" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Land Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {farmerDetails.lands.map((land) => (
                      <div key={land.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{land.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {land.size} acres • {land.crop}
                          </p>
                        </div>
                        <Badge variant={land.status === 'Growing' ? 'default' : 'secondary'}>
                          {land.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Order history will be displayed here...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Engagement analytics will be displayed here...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Communication History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {farmerDetails.communications.map((comm, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{comm.message}</p>
                          <p className="text-sm text-muted-foreground">{comm.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{comm.type}</Badge>
                          <Badge variant={comm.status === 'delivered' || comm.status === 'completed' || comm.status === 'opened' ? 'default' : 'secondary'}>
                            {comm.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};