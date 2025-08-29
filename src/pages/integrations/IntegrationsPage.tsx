
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Globe, 
  Database, 
  MessageSquare, 
  CreditCard,
  BarChart3,
  Plus,
  Settings
} from 'lucide-react';

const IntegrationsPage = () => {
  const integrations = [
    {
      name: 'WhatsApp Business API',
      description: 'Send messages and notifications to farmers via WhatsApp',
      icon: MessageSquare,
      status: 'Connected',
      category: 'Communication'
    },
    {
      name: 'SAP Integration',
      description: 'Sync product data and inventory with SAP systems',
      icon: Database,
      status: 'Available',
      category: 'ERP'
    },
    {
      name: 'Salesforce CRM',
      description: 'Synchronize farmer and dealer data with Salesforce',
      icon: Globe,
      status: 'Available',
      category: 'CRM'
    },
    {
      name: 'Payment Gateway',
      description: 'Process payments and manage transactions',
      icon: CreditCard,
      status: 'Connected',
      category: 'Finance'
    },
    {
      name: 'Analytics API',
      description: 'Export data to external analytics platforms',
      icon: BarChart3,
      status: 'Available',
      category: 'Analytics'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Integrations Hub
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Connect your platform with external services and APIs
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            API Settings
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80">
            <Plus className="h-4 w-4" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Connected</p>
                <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">2</p>
              </div>
              <Zap className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Available</p>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">3</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">API Calls</p>
                <p className="text-3xl font-bold text-amber-800 dark:text-amber-200">1.2K</p>
              </div>
              <BarChart3 className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Success Rate</p>
                <p className="text-3xl font-bold text-purple-800 dark:text-purple-200">99.8%</p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <integration.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {integration.category}
                    </Badge>
                  </div>
                </div>
                <Badge 
                  variant={integration.status === 'Connected' ? 'default' : 'secondary'}
                  className="shrink-0"
                >
                  {integration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {integration.description}
              </CardDescription>
              <div className="flex gap-2">
                {integration.status === 'Connected' ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      Configure
                    </Button>
                    <Button variant="ghost" size="sm">
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="flex-1">
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsPage;
