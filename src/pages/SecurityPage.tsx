import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { 
  Shield, 
  Lock, 
  Key, 
  Fingerprint,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Eye,
  Smartphone,
  Mail,
  History,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SecurityPage = () => {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipRestriction, setIpRestriction] = useState(false);

  const securityEvents = [
    { id: 1, event: 'Successful Login', ip: '192.168.1.1', location: 'Mumbai, India', time: '2 hours ago', status: 'success' },
    { id: 2, event: 'Password Changed', ip: '192.168.1.1', location: 'Mumbai, India', time: '1 day ago', status: 'success' },
    { id: 3, event: 'Failed Login Attempt', ip: '103.45.67.89', location: 'Unknown', time: '2 days ago', status: 'warning' },
    { id: 4, event: 'New Device Login', ip: '192.168.1.2', location: 'Delhi, India', time: '3 days ago', status: 'info' },
    { id: 5, event: 'API Key Generated', ip: '192.168.1.1', location: 'Mumbai, India', time: '1 week ago', status: 'success' }
  ];

  const handleEnable2FA = async () => {
    toast({
      title: "2FA Setup",
      description: "Scan the QR code with your authenticator app to enable 2FA.",
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title="Security Settings"
        description="Manage your account security and access controls"
      />

      <PageContent>
        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="authentication" className="space-y-6">
            {/* Password & Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password & Authentication
                </CardTitle>
                <CardDescription>
                  Manage your password and authentication methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {twoFactorEnabled && <Badge variant="secondary">Enabled</Badge>}
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={(checked) => {
                          setTwoFactorEnabled(checked);
                          if (checked) handleEnable2FA();
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Biometric Authentication</p>
                      <p className="text-sm text-muted-foreground">Use fingerprint or face recognition</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Setup
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Security Keys</p>
                      <p className="text-sm text-muted-foreground">Hardware security keys for authentication</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Key className="h-4 w-4 mr-2" />
                      Add Key
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Management */}
            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
                <CardDescription>
                  Control your active sessions and timeout settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Session Timeout (minutes)</Label>
                    <select 
                      className="w-32 p-2 border rounded-md"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                    >
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="60">60</option>
                      <option value="120">120</option>
                    </select>
                  </div>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      You have 3 active sessions on different devices
                    </AlertDescription>
                  </Alert>
                  
                  <Button variant="destructive" className="w-full">
                    Terminate All Other Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            {/* Access Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Access Controls</CardTitle>
                <CardDescription>
                  Configure access restrictions and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">IP Address Restriction</p>
                      <p className="text-sm text-muted-foreground">
                        Limit access to specific IP addresses
                      </p>
                    </div>
                    <Switch
                      checked={ipRestriction}
                      onCheckedChange={setIpRestriction}
                    />
                  </div>

                  {ipRestriction && (
                    <Alert>
                      <AlertDescription>
                        <div className="space-y-2">
                          <p>Allowed IP Addresses:</p>
                          <div className="space-y-1">
                            <Badge variant="outline">192.168.1.1</Badge>
                            <Badge variant="outline">10.0.0.1</Badge>
                          </div>
                          <Button variant="outline" size="sm">Add IP Address</Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Single Sign-On (SSO)</p>
                      <p className="text-sm text-muted-foreground">
                        Configure SSO for your organization
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">API Access</p>
                      <p className="text-sm text-muted-foreground">
                        Manage API keys and permissions
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Manage Keys</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-Based Access */}
            <Card>
              <CardHeader>
                <CardTitle>Role-Based Access Control</CardTitle>
                <CardDescription>
                  Configure permissions for different user roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Admin Role</p>
                        <p className="text-sm text-muted-foreground">Full system access</p>
                      </div>
                      <Badge>5 users</Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Manager Role</p>
                        <p className="text-sm text-muted-foreground">Limited administrative access</p>
                      </div>
                      <Badge>12 users</Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Viewer Role</p>
                        <p className="text-sm text-muted-foreground">Read-only access</p>
                      </div>
                      <Badge>25 users</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            {/* Security Events */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Security Audit Log</CardTitle>
                    <CardDescription>
                      Recent security events and activities
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Log
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {event.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {event.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          {event.status === 'info' && <Eye className="h-4 w-4 text-blue-500" />}
                          <div>
                            <p className="font-medium">{event.event}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.ip} • {event.location}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{event.time}</span>
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

export default SecurityPage;
export { SecurityPage };