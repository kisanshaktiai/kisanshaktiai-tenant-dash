import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiManagement } from "./components/ApiManagement";
import { WebhookManagement } from "./components/WebhookManagement";
import { IntegrationTemplates } from "./components/IntegrationTemplates";
import { DataTransformations } from "./components/DataTransformations";
import { MonitoringDashboard } from "./components/MonitoringDashboard";
import { DeveloperPortal } from "./components/DeveloperPortal";

export function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("api-keys");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrations & APIs</h1>
        <p className="text-muted-foreground">
          Manage API access, webhooks, and external system integrations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="integrations">Templates</TabsTrigger>
          <TabsTrigger value="transformations">Data Transform</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="docs">Developer Portal</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-6">
          <ApiManagement />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <WebhookManagement />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationTemplates />
        </TabsContent>

        <TabsContent value="transformations" className="space-y-6">
          <DataTransformations />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <MonitoringDashboard />
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <DeveloperPortal />
        </TabsContent>
      </Tabs>
    </div>
  );
}