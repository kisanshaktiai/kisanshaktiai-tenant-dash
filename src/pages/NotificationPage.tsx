import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Volume2,
  BellOff,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Save,
  RefreshCw,
  Filter,
  Download,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [preferences, setPreferences] = useState({
    email: true,
    sms: false,
    push: true,
    inApp: true,
    desktop: true,
    sound: true,
    vibration: false
  });

  const [notificationTypes, setNotificationTypes] = useState({
    farmerActivity: { email: true, sms: false, push: true, priority: 'medium' },
    productUpdates: { email: true, sms: false, push: false, priority: 'low' },
    campaignAlerts: { email: true, sms: true, push: true, priority: 'high' },
    systemAlerts: { email: true, sms: false, push: true, priority: 'critical' },
    marketingNews: { email: false, sms: false, push: false, priority: 'low' },
    dealerActivities: { email: true, sms: false, push: true, priority: 'medium' }
  });

  const recentNotifications = [
    { id: 1, type: 'success', title: 'New Farmer Registered', message: 'Farmer KIS000002 has been successfully registered', time: '5 minutes ago', read: false },
    { id: 2, type: 'info', title: 'Campaign Scheduled', message: 'Monsoon Season campaign scheduled for tomorrow', time: '1 hour ago', read: false },
    { id: 3, type: 'warning', title: 'Low Product Stock', message: 'Fertilizer XYZ stock below reorder point', time: '2 hours ago', read: true },
    { id: 4, type: 'error', title: 'API Rate Limit', message: 'API rate limit reached for SMS service', time: '3 hours ago', read: true },
    { id: 5, type: 'success', title: 'Dealer Onboarded', message: 'New dealer registered in Maharashtra region', time: '5 hours ago', read: true }
  ];

  const handleSavePreferences = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been updated successfully.",
    });
    setLoading(false);
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    return <Badge variant={variants[priority] || 'default'}>{priority.toUpperCase()}</Badge>;
  };

  return (
    <PageLayout>
      <PageHeader
        title="Notification Center"
        description="Manage your notification preferences and view recent alerts"
      />

      <PageContent>
        <Tabs defaultValue="preferences" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-6">
            {/* Global Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Global Preferences
                </CardTitle>
                <CardDescription>
                  Configure your overall notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={preferences.email}
                      onCheckedChange={(checked) => setPreferences({...preferences, email: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get alerts via SMS messages</p>
                    </div>
                    <Switch
                      checked={preferences.sms}
                      onCheckedChange={(checked) => setPreferences({...preferences, sms: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={preferences.push}
                      onCheckedChange={(checked) => setPreferences({...preferences, push: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">In-App Notifications</Label>
                      <p className="text-sm text-muted-foreground">Show notifications within the app</p>
                    </div>
                    <Switch
                      checked={preferences.inApp}
                      onCheckedChange={(checked) => setPreferences({...preferences, inApp: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Sound Alerts</Label>
                      <p className="text-sm text-muted-foreground">Play sound for notifications</p>
                    </div>
                    <Switch
                      checked={preferences.sound}
                      onCheckedChange={(checked) => setPreferences({...preferences, sound: checked})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Categories</CardTitle>
                <CardDescription>
                  Customize notifications for different event types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(notificationTypes).map(([key, value]) => (
                  <div key={key} className="space-y-3 pb-4 border-b last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Configure how you receive {key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications
                        </p>
                      </div>
                      {getPriorityBadge(value.priority)}
                    </div>
                    <div className="flex gap-4 ml-0">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`${key}-email`}
                          checked={value.email}
                          onCheckedChange={(checked) => 
                            setNotificationTypes({
                              ...notificationTypes,
                              [key]: {...value, email: checked}
                            })
                          }
                        />
                        <Label htmlFor={`${key}-email`} className="text-sm cursor-pointer">
                          <Mail className="h-4 w-4" />
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`${key}-sms`}
                          checked={value.sms}
                          onCheckedChange={(checked) => 
                            setNotificationTypes({
                              ...notificationTypes,
                              [key]: {...value, sms: checked}
                            })
                          }
                        />
                        <Label htmlFor={`${key}-sms`} className="text-sm cursor-pointer">
                          <MessageSquare className="h-4 w-4" />
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`${key}-push`}
                          checked={value.push}
                          onCheckedChange={(checked) => 
                            setNotificationTypes({
                              ...notificationTypes,
                              [key]: {...value, push: checked}
                            })
                          }
                        />
                        <Label htmlFor={`${key}-push`} className="text-sm cursor-pointer">
                          <Smartphone className="h-4 w-4" />
                        </Label>
                      </div>
                      <Select
                        value={value.priority}
                        onValueChange={(priority) => 
                          setNotificationTypes({
                            ...notificationTypes,
                            [key]: {...value, priority}
                          })
                        }
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button onClick={handleSavePreferences} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Channels</CardTitle>
                <CardDescription>
                  Configure your notification delivery channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">Email Channel</h4>
                          <p className="text-sm text-muted-foreground">primary@example.com</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Verified</Badge>
                    </div>
                    <Button variant="outline" size="sm">Change Email</Button>
                  </div>

                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-green-500" />
                        <div>
                          <h4 className="font-medium">SMS Channel</h4>
                          <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Verified</Badge>
                    </div>
                    <Button variant="outline" size="sm">Update Number</Button>
                  </div>

                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-purple-500" />
                        <div>
                          <h4 className="font-medium">WhatsApp</h4>
                          <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                        </div>
                      </div>
                      <Badge variant="outline">Not Connected</Badge>
                    </div>
                    <Button variant="outline" size="sm">Connect WhatsApp</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Notification History</CardTitle>
                    <CardDescription>
                      Recent notifications and alerts
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4 mr-2" />
                      Archive All
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        !notification.read ? 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{notification.title}</h4>
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageLayout>
  );
};

export default NotificationPage;
export { NotificationPage };