
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plug, Settings, BarChart3, Webhook, Code, Monitor } from 'lucide-react';
import ApiManagement from './components/ApiManagement';
import WebhookManagement from './components/WebhookManagement';
import IntegrationTemplates from './components/IntegrationTemplates';
import DataTransformations from './components/DataTransformations';
import MonitoringDashboard from './components/MonitoringDashboard';
import DeveloperPortal from './components/DeveloperPortal';

export default function IntegrationsPage() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-2">
            <Plug className="h-8 w-8" />
            Integrations & APIs
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg mt-2">
            Connect your agricultural platform with external systems and services
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="gap-1.5">
              <Code className="h-3 w-3" />
              RESTful APIs
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Webhook className="h-3 w-3" />
              Real-time Webhooks
            </Badge>
          </div>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          API Settings
        </Button>
      </div>

      {/* Integration Tabs */}
      <Tabs defaultValue="apis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="apis">APIs</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="transforms">Transforms</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="developer">Developer</TabsTrigger>
        </TabsList>

        <TabsContent value="apis">
          <ApiManagement />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookManagement />
        </TabsContent>

        <TabsContent value="templates">
          <IntegrationTemplates />
        </TabsContent>

        <TabsContent value="transforms">
          <DataTransformations />
        </TabsContent>

        <TabsContent value="monitoring">
          <MonitoringDashboard />
        </TabsContent>

        <TabsContent value="developer">
          <DeveloperPortal />
        </TabsContent>
      </Tabs>
    </div>
  );
}
