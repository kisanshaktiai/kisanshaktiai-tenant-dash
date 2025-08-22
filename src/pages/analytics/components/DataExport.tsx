
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File, 
  Database,
  Calendar,
  Filter,
  Share,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { useExportLogsQuery } from '@/hooks/data/useAnalyticsQuery';

export const DataExport = () => {
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { data: exportLogs = [] } = useExportLogsQuery();

  const exportSources = [
    { id: "farmers", name: "Farmers Data", description: "Complete farmer profiles and engagement", icon: Database },
    { id: "products", name: "Products Catalog", description: "Product listings with performance metrics", icon: FileText },
    { id: "analytics", name: "Analytics Reports", description: "Pre-computed analytics and insights", icon: FileSpreadsheet },
    { id: "campaigns", name: "Campaign Data", description: "Marketing campaigns and performance", icon: File },
    { id: "dealers", name: "Dealer Network", description: "Dealer information and territories", icon: Database }
  ];

  const exportFormats = [
    { 
      id: "excel", 
      name: "Excel Workbook", 
      description: "Full-featured spreadsheet with multiple sheets",
      icon: FileSpreadsheet,
      extension: ".xlsx"
    },
    { 
      id: "csv", 
      name: "CSV File", 
      description: "Comma-separated values for data analysis",
      icon: FileText,
      extension: ".csv"
    },
    { 
      id: "pdf", 
      name: "PDF Report", 
      description: "Formatted report document",
      icon: File,
      extension: ".pdf"
    }
  ];

  const quickExports = [
    {
      id: "farmer-summary",
      name: "Farmer Summary Report",
      description: "Key metrics and farmer overview",
      source: "farmers",
      format: "excel",
      estimated_time: "2-3 minutes"
    },
    {
      id: "monthly-analytics",
      name: "Monthly Analytics",
      description: "Complete monthly performance data",
      source: "analytics",
      format: "pdf",
      estimated_time: "3-5 minutes"
    },
    {
      id: "product-performance",
      name: "Product Performance Export",
      description: "Sales and product metrics",
      source: "products",
      format: "csv",
      estimated_time: "1-2 minutes"
    }
  ];

  const recentExports = exportLogs.slice(0, 10);

  const handleExport = async () => {
    if (!selectedSource || !selectedFormat) return;
    
    setIsExporting(true);
    
    // Mock export process
    setTimeout(() => {
      setIsExporting(false);
      setSelectedSource("");
      setSelectedFormat("");
    }, 3000);
  };

  const handleQuickExport = (exportConfig: any) => {
    console.log("Quick export:", exportConfig);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Export & Integration</h2>
          <p className="text-muted-foreground">Export your data in various formats for external analysis</p>
        </div>
        <Button variant="outline">
          <Share className="h-4 w-4 mr-2" />
          API Access
        </Button>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList>
          <TabsTrigger value="export">Custom Export</TabsTrigger>
          <TabsTrigger value="quick">Quick Exports</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configure Export</CardTitle>
                <CardDescription>Select data source and format for your export</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Source Selection */}
                <div>
                  <h4 className="font-medium mb-3">Select Data Source</h4>
                  <div className="space-y-2">
                    {exportSources.map((source) => {
                      const Icon = source.icon;
                      return (
                        <div
                          key={source.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedSource === source.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedSource(source.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{source.name}</div>
                              <div className="text-sm text-muted-foreground">{source.description}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Format Selection */}
                <div>
                  <h4 className="font-medium mb-3">Export Format</h4>
                  <div className="space-y-2">
                    {exportFormats.map((format) => {
                      const Icon = format.icon;
                      return (
                        <div
                          key={format.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedFormat === format.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedFormat(format.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{format.name}</div>
                                <div className="text-sm text-muted-foreground">{format.description}</div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {format.extension}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Export Options */}
                <div>
                  <h4 className="font-medium mb-3">Export Options</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm">Date Range</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="All time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="90d">Last 90 Days</SelectItem>
                            <SelectItem value="1y">Last Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm">Include Archives</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Active only" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active Only</SelectItem>
                            <SelectItem value="all">Include Archived</SelectItem>
                            <SelectItem value="archived">Archived Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full" 
                  onClick={handleExport}
                  disabled={!selectedSource || !selectedFormat || isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Export...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Start Export
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Export Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Export Preview</CardTitle>
                <CardDescription>Preview of your export configuration</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSource && selectedFormat ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <h4 className="font-medium mb-2">Export Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Data Source:</span>
                          <span className="font-medium">
                            {exportSources.find(s => s.id === selectedSource)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Format:</span>
                          <span className="font-medium">
                            {exportFormats.find(f => f.id === selectedFormat)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Size:</span>
                          <span className="font-medium">~2.5 MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Time:</span>
                          <span className="font-medium">2-4 minutes</span>
                        </div>
                      </div>
                    </div>
                    
                    {isExporting && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing...</span>
                          <span>65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a data source and format to preview your export
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quick">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickExports.map((exportConfig) => (
              <Card key={exportConfig.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{exportConfig.name}</CardTitle>
                  <CardDescription>{exportConfig.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Source:</span>
                      <Badge variant="outline">{exportConfig.source}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Format:</span>
                      <Badge variant="outline">{exportConfig.format.toUpperCase()}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time:</span>
                      <span className="text-muted-foreground">{exportConfig.estimated_time}</span>
                    </div>
                    <Button 
                      className="w-full" 
                      size="sm" 
                      onClick={() => handleQuickExport(exportConfig)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>Track and download your previous exports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No exports found. Create your first export to see it here.
                    </p>
                  </div>
                ) : (
                  recentExports.map((exportLog) => (
                    <div
                      key={exportLog.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon('completed')}
                          <div>
                            <div className="font-medium">
                              {exportLog.data_source} Export ({exportLog.export_format.toUpperCase()})
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(exportLog.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <div>{exportLog.row_count.toLocaleString()} rows</div>
                          <div className="text-muted-foreground">
                            {formatFileSize(exportLog.file_size_bytes)}
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
