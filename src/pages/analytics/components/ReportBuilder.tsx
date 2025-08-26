import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Trash2, 
  Eye, 
  Download, 
  Mail, 
  Clock, 
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Calendar,
  Users,
  Package,
  TrendingUp
} from "lucide-react";

export const ReportBuilder = () => {
  const [reportName, setReportName] = useState("");
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);
  const [selectedVisualization, setSelectedVisualization] = useState("table");
  const [isScheduled, setIsScheduled] = useState(false);

  const dataSources = [
    { id: "farmers", name: "Farmer Data", icon: Users, fields: ["Total Farmers", "Active Users", "Engagement Rate", "Geographic Distribution"] },
    { id: "products", name: "Product Data", icon: Package, fields: ["Sales Volume", "Revenue", "Inventory Levels", "Category Performance"] },
    { id: "campaigns", name: "Campaign Data", icon: TrendingUp, fields: ["Campaign Performance", "ROI", "Reach", "Conversion Rates"] },
    { id: "analytics", name: "Analytics Data", icon: BarChart3, fields: ["Page Views", "User Sessions", "Bounce Rate", "Time on Site"] }
  ];

  const visualizationTypes = [
    { id: "table", name: "Table", icon: Table, description: "Structured data in rows and columns" },
    { id: "bar", name: "Bar Chart", icon: BarChart3, description: "Compare values across categories" },
    { id: "line", name: "Line Chart", icon: LineChart, description: "Show trends over time" },
    { id: "pie", name: "Pie Chart", icon: PieChart, description: "Show proportions of a whole" }
  ];

  const scheduledReports = [
    { id: 1, name: "Weekly Farmer Report", schedule: "Every Monday", recipients: 3, lastRun: "2 days ago" },
    { id: 2, name: "Monthly Sales Summary", schedule: "1st of every month", recipients: 5, lastRun: "1 week ago" },
    { id: 3, name: "Product Performance", schedule: "Every Friday", recipients: 2, lastRun: "5 days ago" },
    { id: 4, name: "Campaign Analytics", schedule: "Bi-weekly", recipients: 4, lastRun: "3 days ago" }
  ];

  const [filters, setFilters] = useState([
    { field: "", operator: "", value: "", id: 1 }
  ]);

  const addFilter = () => {
    setFilters([...filters, { field: "", operator: "", value: "", id: Date.now() }]);
  };

  const removeFilter = (id: number) => {
    setFilters(filters.filter(filter => filter.id !== id));
  };

  const toggleDataSource = (sourceId: string) => {
    setSelectedDataSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Custom Report Builder</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Report Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input 
                      id="reportName"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Enter report name"
                    />
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

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="scheduled"
                      checked={isScheduled}
                      onCheckedChange={setIsScheduled}
                    />
                    <Label htmlFor="scheduled">Schedule this report</Label>
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
                </CardContent>
              </Card>

              {/* Data Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Sources</CardTitle>
                  <CardDescription>Select data to include in your report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dataSources.map((source) => {
                    const Icon = source.icon;
                    const isSelected = selectedDataSources.includes(source.id);
                    
                    return (
                      <div 
                        key={source.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleDataSource(source.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" />
                          <div className="flex-1">
                            <div className="font-medium">{source.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {source.fields.length} fields available
                            </div>
                          </div>
                          {isSelected && (
                            <Badge variant="default">Selected</Badge>
                          )}
                        </div>
                        {isSelected && (
                          <div className="mt-2 space-y-1">
                            {source.fields.map((field) => (
                              <div key={field} className="text-xs text-muted-foreground ml-8">
                                • {field}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Visualization Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Visualization</CardTitle>
                  <CardDescription>Choose how to display your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {visualizationTypes.map((viz) => {
                      const Icon = viz.icon;
                      return (
                        <div 
                          key={viz.id}
                          className={`p-4 border rounded-lg cursor-pointer text-center transition-colors ${
                            selectedVisualization === viz.id 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedVisualization(viz.id)}
                        >
                          <Icon className="h-8 w-8 mx-auto mb-2" />
                          <div className="font-medium text-sm">{viz.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {viz.description}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Filters</CardTitle>
                  <Button variant="outline" size="sm" onClick={addFilter}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Filter
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filters.map((filter) => (
                    <div key={filter.id} className="flex items-center space-x-2">
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="farmers">Farmers</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="greater">Greater than</SelectItem>
                          <SelectItem value="less">Less than</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Value" className="flex-1" />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeFilter(filter.id)}
                        disabled={filters.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Report Preview</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {selectedDataSources.length === 0 
                          ? "Select data sources to preview your report"
                          : "Report preview will appear here"
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Save as Draft</Button>
                <Button>Generate Report</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Manage your automated report generation and distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.schedule} • {report.recipients} recipients
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">
                        Last run: {report.lastRun}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Farmer Analytics Summary", description: "Comprehensive farmer engagement and performance metrics", category: "Analytics" },
              { name: "Product Sales Report", description: "Sales performance, inventory, and revenue analysis", category: "Sales" },
              { name: "Campaign Performance", description: "Marketing campaign effectiveness and ROI analysis", category: "Marketing" },
              { name: "Executive Dashboard", description: "High-level KPIs and business overview", category: "Executive" },
              { name: "Seasonal Trends", description: "Agricultural season-based demand and performance", category: "Seasonal" },
              { name: "Geographic Analysis", description: "Regional performance and market penetration", category: "Geographic" }
            ].map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Use Template</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};