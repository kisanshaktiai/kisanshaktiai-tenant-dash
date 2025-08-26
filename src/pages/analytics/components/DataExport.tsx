import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Download, 
  FileText, 
  Database, 
  Cloud, 
  Calendar, 
  Settings, 
  Link,
  CheckCircle,
  Clock,
  AlertCircle,
  Code
} from "lucide-react";

export const DataExport = () => {
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [selectedDataset, setSelectedDataset] = useState("farmers");
  const [isScheduled, setIsScheduled] = useState(false);

  const exportFormats = [
    { id: "csv", name: "CSV", icon: FileText, description: "Comma-separated values" },
    { id: "excel", name: "Excel", icon: FileText, description: "Microsoft Excel format" },
    { id: "pdf", name: "PDF", icon: FileText, description: "Portable document format" },
    { id: "json", name: "JSON", icon: Code, description: "JavaScript object notation" }
  ];

  const datasets = [
    { id: "farmers", name: "Farmer Data", records: "12,847", size: "2.3 MB" },
    { id: "products", name: "Product Catalog", records: "1,234", size: "850 KB" },
    { id: "campaigns", name: "Campaign Data", records: "456", size: "1.1 MB" },
    { id: "analytics", name: "Analytics Data", records: "98,765", size: "5.7 MB" },
    { id: "transactions", name: "Transaction Data", records: "23,456", size: "3.2 MB" }
  ];

  const scheduledExports = [
    { 
      id: 1, 
      name: "Weekly Farmer Export", 
      format: "CSV", 
      dataset: "Farmer Data",
      schedule: "Every Monday 9:00 AM", 
      status: "active",
      lastRun: "2 days ago"
    },
    { 
      id: 2, 
      name: "Monthly Analytics", 
      format: "Excel", 
      dataset: "Analytics Data",
      schedule: "1st of every month", 
      status: "active",
      lastRun: "1 week ago"
    },
    { 
      id: 3, 
      name: "Product Sync", 
      format: "JSON", 
      dataset: "Product Catalog",
      schedule: "Daily 2:00 AM", 
      status: "paused",
      lastRun: "5 days ago"
    }
  ];

  const apiIntegrations = [
    { 
      name: "Power BI Connector", 
      type: "bi_tool", 
      status: "connected",
      lastSync: "1 hour ago",
      description: "Real-time data feed to Power BI dashboards"
    },
    { 
      name: "Tableau Integration", 
      type: "bi_tool", 
      status: "pending",
      lastSync: "Never",
      description: "Data visualization and analytics platform"
    },
    { 
      name: "Custom CRM Sync", 
      type: "crm", 
      status: "connected",
      lastSync: "30 minutes ago",
      description: "Farmer data synchronization with external CRM"
    },
    { 
      name: "ERP Integration", 
      type: "erp", 
      status: "error",
      lastSync: "2 days ago",
      description: "Product and inventory data sync"
    }
  ];

  const webhookEndpoints = [
    { 
      name: "Farmer Registration", 
      url: "https://api.example.com/webhooks/farmers",
      events: ["farmer.created", "farmer.updated"],
      status: "active"
    },
    { 
      name: "Product Updates", 
      url: "https://api.example.com/webhooks/products",
      events: ["product.created", "product.updated", "product.deleted"],
      status: "active"
    },
    { 
      name: "Campaign Events", 
      url: "https://api.example.com/webhooks/campaigns",
      events: ["campaign.started", "campaign.completed"],
      status: "inactive"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "paused":
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "error":
      case "inactive":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "connected":
        return "text-green-600 bg-green-50";
      case "paused":
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "error":
      case "inactive":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Data Export & Integration</h2>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Quick Export
        </Button>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="export">Data Export</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Exports</TabsTrigger>
          <TabsTrigger value="integrations">API Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Export Configuration */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Dataset</Label>
                    <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dataset" />
                      </SelectTrigger>
                      <SelectContent>
                        {datasets.map((dataset) => (
                          <SelectItem key={dataset.id} value={dataset.id}>
                            {dataset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Date Range</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Export Format</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {exportFormats.map((format) => {
                        const Icon = format.icon;
                        return (
                          <div 
                            key={format.id}
                            className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${
                              selectedFormat === format.id 
                                ? 'border-primary bg-primary/5' 
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedFormat(format.id)}
                          >
                            <Icon className="h-6 w-6 mx-auto mb-1" />
                            <div className="font-medium text-sm">{format.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {format.description}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="scheduled"
                      checked={isScheduled}
                      onCheckedChange={setIsScheduled}
                    />
                    <Label htmlFor="scheduled">Schedule this export</Label>
                  </div>

                  {isScheduled && (
                    <div className="space-y-2">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Email recipients" />
                    </div>
                  )}

                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Dataset Overview */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Datasets</CardTitle>
                  <CardDescription>Choose from available data sources for export</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {datasets.map((dataset) => (
                    <div 
                      key={dataset.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDataset === dataset.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedDataset(dataset.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{dataset.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {dataset.records} records
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{dataset.size}</div>
                          {selectedDataset === dataset.id && (
                            <Badge variant="default">Selected</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Export History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Exports</CardTitle>
                  <CardDescription>Your recent data export history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Farmer Data Export", date: "2 hours ago", format: "CSV", size: "2.3 MB" },
                      { name: "Product Analytics", date: "1 day ago", format: "Excel", size: "1.8 MB" },
                      { name: "Campaign Report", date: "3 days ago", format: "PDF", size: "950 KB" },
                      { name: "Transaction Data", date: "1 week ago", format: "JSON", size: "3.2 MB" }
                    ].map((export_, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{export_.name}</div>
                            <div className="text-sm text-muted-foreground">{export_.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{export_.format}</Badge>
                          <span className="text-sm text-muted-foreground">{export_.size}</span>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Scheduled Exports</CardTitle>
                <CardDescription>Manage automated data export schedules</CardDescription>
              </div>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledExports.map((export_) => (
                  <div key={export_.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(export_.status)}
                      <div>
                        <div className="font-medium">{export_.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {export_.dataset} • {export_.format} • {export_.schedule}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">
                        Last run: {export_.lastRun}
                      </div>
                      <Badge className={getStatusColor(export_.status)}>
                        {export_.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>API Integrations</CardTitle>
                <CardDescription>Connect with external BI tools and platforms</CardDescription>
              </div>
              <Button>
                <Link className="h-4 w-4 mr-2" />
                New Integration
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiIntegrations.map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(integration.status)}
                      <div>
                        <div className="font-medium">{integration.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {integration.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">
                        Last sync: {integration.lastSync}
                      </div>
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Database className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Integration endpoints and documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">REST API Endpoint</div>
                  <code className="text-sm bg-muted p-2 rounded block">
                    https://api.tenant.com/v1/export
                  </code>
                  <Button variant="outline" size="sm" className="mt-2">
                    View Docs
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">GraphQL Endpoint</div>
                  <code className="text-sm bg-muted p-2 rounded block">
                    https://api.tenant.com/graphql
                  </code>
                  <Button variant="outline" size="sm" className="mt-2">
                    View Schema
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Webhook Endpoints</CardTitle>
                <CardDescription>Real-time data notifications and event triggers</CardDescription>
              </div>
              <Button>
                <Link className="h-4 w-4 mr-2" />
                Add Webhook
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhookEndpoints.map((webhook, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(webhook.status)}
                        <span className="font-medium">{webhook.name}</span>
                      </div>
                      <Badge className={getStatusColor(webhook.status)}>
                        {webhook.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">URL:</span>
                        <code className="text-sm ml-2">{webhook.url}</code>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Events:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">Test</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Webhook Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Webhook</CardTitle>
              <CardDescription>Configure a new webhook endpoint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="webhookName">Webhook Name</Label>
                  <Input id="webhookName" placeholder="Enter webhook name" />
                </div>
                <div>
                  <Label htmlFor="webhookUrl">Endpoint URL</Label>
                  <Input id="webhookUrl" placeholder="https://api.example.com/webhook" />
                </div>
              </div>
              <div>
                <Label htmlFor="webhookEvents">Events</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select events to trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer.created">Farmer Created</SelectItem>
                    <SelectItem value="farmer.updated">Farmer Updated</SelectItem>
                    <SelectItem value="product.created">Product Created</SelectItem>
                    <SelectItem value="campaign.started">Campaign Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="webhookHeaders">Custom Headers (JSON)</Label>
                <Textarea 
                  id="webhookHeaders" 
                  placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                  className="h-20"
                />
              </div>
              <Button>Create Webhook</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};