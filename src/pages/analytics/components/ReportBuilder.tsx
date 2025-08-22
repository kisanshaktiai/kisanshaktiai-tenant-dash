
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Play, 
  Save, 
  Download, 
  Calendar, 
  Filter,
  BarChart3,
  Table2,
  PieChart,
  LineChart,
  Settings,
  Clock
} from "lucide-react";
import { useCustomReportsQuery } from '@/hooks/data/useAnalyticsQuery';

export const ReportBuilder = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportType, setReportType] = useState("table");
  const [dataSource, setDataSource] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: reports = [], isLoading } = useCustomReportsQuery();

  const dataSources = [
    { id: "farmers", name: "Farmers", description: "Farmer profiles and engagement data" },
    { id: "products", name: "Products", description: "Product catalog and performance" },
    { id: "campaigns", name: "Campaigns", description: "Marketing campaigns and results" },
    { id: "dealers", name: "Dealers", description: "Dealer network and performance" },
    { id: "analytics", name: "Analytics", description: "Pre-computed analytics metrics" }
  ];

  const reportTemplates = [
    {
      id: "farmer-engagement",
      name: "Farmer Engagement Report",
      description: "Comprehensive view of farmer activity and engagement",
      type: "table",
      dataSource: "farmers",
      metrics: ["engagement_score", "app_usage_days", "total_transactions"]
    },
    {
      id: "product-performance",
      name: "Product Performance Dashboard",
      description: "Sales metrics and product analytics",
      type: "dashboard",
      dataSource: "products",
      metrics: ["revenue", "orders_count", "conversion_rate"]
    },
    {
      id: "campaign-roi",
      name: "Campaign ROI Analysis",
      description: "Marketing campaign effectiveness and returns",
      type: "chart",
      dataSource: "campaigns",
      metrics: ["budget_consumed", "deliveries", "engagement_rate"]
    }
  ];

  const availableMetrics = {
    farmers: [
      { id: "total_count", name: "Total Farmers", type: "count" },
      { id: "engagement_score", name: "Engagement Score", type: "average" },
      { id: "lifetime_value", name: "Lifetime Value", type: "sum" },
      { id: "churn_risk", name: "Churn Risk", type: "average" },
      { id: "app_usage_days", name: "App Usage Days", type: "sum" }
    ],
    products: [
      { id: "views_count", name: "Product Views", type: "sum" },
      { id: "orders_count", name: "Orders", type: "sum" },
      { id: "revenue", name: "Revenue", type: "sum" },
      { id: "conversion_rate", name: "Conversion Rate", type: "average" }
    ],
    campaigns: [
      { id: "budget_consumed", name: "Budget Spent", type: "sum" },
      { id: "reach", name: "Total Reach", type: "sum" },
      { id: "engagement_rate", name: "Engagement Rate", type: "average" },
      { id: "conversion_rate", name: "Conversion Rate", type: "average" }
    ]
  };

  const recentExecutions = [
    {
      id: "1",
      reportName: "Farmer Engagement Report",
      executedAt: "2024-01-15 14:30",
      status: "completed",
      rowCount: 1247,
      executionTime: "2.3s"
    },
    {
      id: "2", 
      reportName: "Product Performance Dashboard",
      executedAt: "2024-01-15 12:15",
      status: "completed",
      rowCount: 456,
      executionTime: "1.8s"
    },
    {
      id: "3",
      reportName: "Monthly Revenue Analysis",
      executedAt: "2024-01-15 10:00",
      status: "running",
      rowCount: 0,
      executionTime: "..."
    }
  ];

  const handleCreateReport = () => {
    // Mock report creation
    console.log("Creating report:", {
      name: reportName,
      description: reportDescription,
      type: reportType,
      dataSource: dataSource
    });
    setIsCreateDialogOpen(false);
    setReportName("");
    setReportDescription("");
    setReportType("table");
    setDataSource("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Custom Report Builder</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Build a custom report to analyze your data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Report Name</label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe what this report will show"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Report Type</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Table Report</SelectItem>
                      <SelectItem value="chart">Chart Report</SelectItem>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Data Source</label>
                  <Select value={dataSource} onValueChange={setDataSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReport}>
                  Create Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="executions">Recent Executions</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Configuration */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>Configure your custom report settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Source Selection */}
                <div>
                  <h4 className="font-medium mb-3">Select Data Source</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dataSources.map((source) => (
                      <div
                        key={source.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          dataSource === source.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setDataSource(source.id)}
                      >
                        <div className="font-medium">{source.name}</div>
                        <div className="text-sm text-muted-foreground">{source.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics Selection */}
                {dataSource && (
                  <div>
                    <h4 className="font-medium mb-3">Select Metrics</h4>
                    <div className="space-y-2">
                      {availableMetrics[dataSource as keyof typeof availableMetrics]?.map((metric) => (
                        <div key={metric.id} className="flex items-center space-x-2 p-2 border rounded">
                          <input type="checkbox" id={metric.id} />
                          <label htmlFor={metric.id} className="flex-1 cursor-pointer">
                            <span className="font-medium">{metric.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {metric.type}
                            </Badge>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div>
                  <h4 className="font-medium mb-3">Filters</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm">Date Range</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm">Region</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="All regions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            <SelectItem value="north">North</SelectItem>
                            <SelectItem value="south">South</SelectItem>
                            <SelectItem value="east">East</SelectItem>
                            <SelectItem value="west">West</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Run Report
                  </Button>
                  <Button variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>Live preview of your report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Configure your report to see preview
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.type === 'table' && <Table2 className="h-5 w-5 text-muted-foreground" />}
                    {template.type === 'chart' && <BarChart3 className="h-5 w-5 text-muted-foreground" />}
                    {template.type === 'dashboard' && <PieChart className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Data Source: </span>
                      <Badge variant="outline">{template.dataSource}</Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Metrics: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.metrics.slice(0, 2).map((metric) => (
                          <Badge key={metric} variant="secondary" className="text-xs">
                            {metric.replace('_', ' ')}
                          </Badge>
                        ))}
                        {template.metrics.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.metrics.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button className="w-full" size="sm">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Report Executions</CardTitle>
              <CardDescription>Track your report runs and download results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExecutions.map((execution) => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{execution.reportName}</div>
                          <div className="text-sm text-muted-foreground">
                            Executed: {execution.executedAt}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge
                          variant={
                            execution.status === 'completed' ? 'default' :
                            execution.status === 'running' ? 'secondary' : 'destructive'
                          }
                        >
                          {execution.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {execution.rowCount} rows • {execution.executionTime}
                        </div>
                      </div>
                      
                      {execution.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
