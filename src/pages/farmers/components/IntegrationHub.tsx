
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, CheckCircle, AlertCircle, Clock, 
  MessageSquare, Phone, Mail, Calendar, 
  Database, Webhook, Key, Link
} from 'lucide-react';

export const IntegrationHub: React.FC = () => {
  const [integrations] = useState([
    {
      id: '1',
      name: 'WhatsApp Business API',
      type: 'communication',
      status: 'connected',
      description: 'Send messages and receive responses via WhatsApp',
      icon: MessageSquare,
      lastSync: '2024-01-20 10:30 AM',
      config: { apiKey: '****-****-****-1234', webhook: 'https://api.example.com/webhook' }
    },
    {
      id: '2',
      name: 'SMS Gateway',
      type: 'communication',
      status: 'connected',
      description: 'Bulk SMS messaging for farmer notifications',
      icon: Phone,
      lastSync: '2024-01-20 09:45 AM',
      config: { provider: 'Twilio', endpoint: 'https://api.twilio.com' }
    },
    {
      id: '3',
      name: 'Email Service',
      type: 'communication',
      status: 'error',
      description: 'Email automation and newsletters',
      icon: Mail,
      lastSync: '2024-01-19 02:15 PM',
      config: { provider: 'SendGrid', status: 'Authentication failed' }
    },
    {
      id: '4',
      name: 'Google Calendar',
      type: 'productivity',
      status: 'connected',
      description: 'Schedule follow-ups and appointments',
      icon: Calendar,
      lastSync: '2024-01-20 11:00 AM',
      config: { scope: 'calendar.events', clientId: 'google-****-1234' }
    },
    {
      id: '5',
      name: 'CRM Sync',
      type: 'data',
      status: 'pending',
      description: 'Sync farmer data with external CRM systems',
      icon: Database,
      lastSync: 'Never',
      config: { provider: 'Salesforce', status: 'Setup required' }
    },
    {
      id: '6',
      name: 'Webhook Endpoints',
      type: 'api',
      status: 'connected',
      description: 'Real-time data sync with third-party systems',
      icon: Webhook,
      lastSync: '2024-01-20 10:15 AM',
      config: { endpoints: 3, activeHooks: 2 }
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'error': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Integration Hub</h2>
          <p className="text-muted-foreground">Manage third-party integrations and API connections</p>
        </div>
        <Button className="flex items-center gap-2">
          <Link className="h-4 w-4" />
          Add Integration
        </Button>
      </div>

      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issues</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Calls Today</p>
                <p className="text-2xl font-bold">2.4K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="data">Data & CRM</TabsTrigger>
          <TabsTrigger value="api">API & Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <integration.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {integration.name}
                          {getStatusIcon(integration.status)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      <Switch defaultChecked={integration.status === 'connected'} />
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium">Last Sync</p>
                      <p className="text-sm text-muted-foreground">{integration.lastSync}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Type</p>
                      <p className="text-sm text-muted-foreground capitalize">{integration.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Configuration</p>
                      <div className="flex gap-2 mt-1">
                        {Object.entries(integration.config).map(([key, value], index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {key}: {typeof value === 'string' ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {integration.status === 'error' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-700">
                          {integration.config.status || 'Integration error - check configuration'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">
                        Troubleshoot
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <div className="grid gap-4">
            {integrations.filter(i => i.type === 'communication').map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <integration.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {integration.name}
                          {getStatusIcon(integration.status)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      <Switch defaultChecked={integration.status === 'connected'} />
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Messages Sent Today</p>
                        <p className="text-2xl font-bold">1,247</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Success Rate</p>
                        <p className="text-2xl font-bold text-green-600">98.5%</p>
                      </div>
                    </div>
                    
                    {integration.status === 'connected' && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Test Connection</Button>
                        <Button variant="outline" size="sm">View Logs</Button>
                        <Button variant="outline" size="sm">Send Test Message</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid gap-4">
            {integrations.filter(i => i.type === 'data' || i.type === 'productivity').map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <integration.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {integration.name}
                          {getStatusIcon(integration.status)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      <Switch defaultChecked={integration.status === 'connected'} />
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {integration.status === 'pending' && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <p className="text-sm text-yellow-700">Setup required to activate this integration</p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                          Complete Setup
                        </Button>
                      </div>
                    )}

                    {integration.status === 'connected' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Records Synced</p>
                          <p className="text-2xl font-bold">5,247</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Last Sync</p>
                          <p className="text-sm text-muted-foreground">{integration.lastSync}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid gap-4">
            {integrations.filter(i => i.type === 'api').map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <integration.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {integration.name}
                          {getStatusIcon(integration.status)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Active Endpoints</p>
                        <p className="text-2xl font-bold">{integration.config.endpoints || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Active Hooks</p>
                        <p className="text-2xl font-bold">{integration.config.activeHooks || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Requests Today</p>
                        <p className="text-2xl font-bold">1,856</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Manage Endpoints</Button>
                      <Button variant="outline" size="sm">API Documentation</Button>
                      <Button variant="outline" size="sm">Generate Key</Button>
                    </div>
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
