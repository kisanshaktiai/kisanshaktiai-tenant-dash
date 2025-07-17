import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle,
  CheckCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

export default function BulkImport() {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast({
        title: 'Invalid file format',
        description: 'Please upload a CSV or Excel file',
        variant: 'destructive'
      });
      return;
    }

    simulateImport();
  };

  const simulateImport = async () => {
    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      setImportProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Simulate results
    setImportResult({
      total: 150,
      successful: 142,
      failed: 8,
      errors: [
        { row: 23, field: 'price_per_unit', message: 'Invalid price format' },
        { row: 45, field: 'category_id', message: 'Category not found' },
        { row: 67, field: 'sku', message: 'Duplicate SKU' },
        { row: 89, field: 'stock_quantity', message: 'Invalid quantity' },
        { row: 102, field: 'name', message: 'Product name too long' },
        { row: 128, field: 'unit_type', message: 'Invalid unit type' },
        { row: 134, field: 'brand', message: 'Brand name required' },
        { row: 147, field: 'min_order_quantity', message: 'Invalid minimum order' }
      ]
    });

    setIsImporting(false);
    
    toast({
      title: 'Import completed',
      description: '142 products imported successfully, 8 failed'
    });
  };

  const downloadTemplate = () => {
    // In a real app, this would download an actual CSV template
    toast({
      title: 'Template downloaded',
      description: 'CSV template has been downloaded to your device'
    });
  };

  const exportProducts = () => {
    // In a real app, this would export current products
    toast({
      title: 'Export started',
      description: 'Your products are being exported. You will receive a download link shortly.'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import & Export
          </CardTitle>
          <CardDescription>
            Import products from Excel/CSV files or export your current catalog
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle>Import Products</CardTitle>
            <CardDescription>
              Upload a CSV or Excel file to add multiple products at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Drop your file here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV and Excel files (up to 10MB)
                </p>
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="mt-4" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
            </div>

            {/* Import Progress */}
            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Importing products...</span>
                  <span className="text-sm text-muted-foreground">{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>
            )}

            {/* Import Results */}
            {importResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{importResult.successful}</div>
                    <div className="text-sm text-muted-foreground">Success</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Import Errors
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded text-sm">
                          <span>Row {error.row}: {error.message}</span>
                          <Badge variant="destructive">{error.field}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Template Download */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Download Template</div>
                  <div className="text-sm text-muted-foreground">
                    Get the CSV template with required columns
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle>Export Products</CardTitle>
            <CardDescription>
              Download your current product catalog in various formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">Complete Catalog Export</div>
                    <div className="text-sm text-muted-foreground">
                      All products with full details
                    </div>
                  </div>
                  <Badge variant="secondary">2,456 products</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportProducts}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportProducts}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">Active Products Only</div>
                    <div className="text-sm text-muted-foreground">
                      Currently active and available products
                    </div>
                  </div>
                  <Badge variant="default">2,201 products</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportProducts}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportProducts}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">Low Stock Alert</div>
                    <div className="text-sm text-muted-foreground">
                      Products with stock below minimum threshold
                    </div>
                  </div>
                  <Badge variant="destructive">47 products</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportProducts}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportProducts}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">Custom Export</div>
                    <div className="text-sm text-muted-foreground">
                      Select specific fields and filters
                    </div>
                  </div>
                  <Badge variant="outline">Configure</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Configure Custom Export
                </Button>
              </div>
            </div>

            {/* Export History */}
            <div className="space-y-3">
              <h4 className="font-medium">Recent Exports</h4>
              <div className="space-y-2">
                {[
                  { name: 'complete_catalog_2024.csv', date: '2 hours ago', status: 'completed' },
                  { name: 'active_products_2024.xlsx', date: '1 day ago', status: 'completed' },
                  { name: 'low_stock_report.csv', date: '3 days ago', status: 'completed' }
                ].map((export_, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{export_.name}</div>
                        <div className="text-xs text-muted-foreground">{export_.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {export_.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}