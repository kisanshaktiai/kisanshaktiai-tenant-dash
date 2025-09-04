import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle,
  CheckCircle,
  X,
  FileSpreadsheet,
  CloudUpload,
  BarChart3,
  Package,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

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

export default function EnhancedBulkImport() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

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

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: 'Invalid file format',
        description: 'Please upload a CSV or Excel file (.csv, .xlsx, .xls)',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
    
    // Preview the file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setPreviewData(jsonData.slice(0, 5)); // Preview first 5 rows
      }
    };
    reader.readAsBinaryString(file);
  };

  const processImport = async () => {
    if (!selectedFile || !currentTenant) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let successful = 0;
          let failed = 0;
          const errors: ImportResult['errors'] = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i] as any;
            const progress = Math.floor(((i + 1) / jsonData.length) * 100);
            setImportProgress(progress);

            try {
              // Map Excel columns to database fields
              const productData = {
                tenant_id: currentTenant.id,
                name: row['Product Name'] || row['name'],
                sku: row['SKU'] || row['sku'],
                brand: row['Brand'] || row['brand'],
                category_id: row['Category ID'] || row['category_id'] || 'default',
                price_per_unit: parseFloat(row['Price'] || row['price_per_unit'] || '0'),
                stock_quantity: parseInt(row['Stock'] || row['stock_quantity'] || '0'),
                unit_type: row['Unit Type'] || row['unit_type'] || 'kg',
                availability_status: row['Status'] || row['availability_status'] || 'in_stock',
                is_active: row['Active'] !== 'false',
                is_featured: row['Featured'] === 'true',
                product_type: row['Product Type'] || row['product_type'] || 'general',
                is_organic: row['Organic'] === 'true',
                active_ingredients: row['Active Ingredients'] ? row['Active Ingredients'].split(',') : [],
                suitable_crops: row['Suitable Crops'] ? row['Suitable Crops'].split(',') : [],
                dosage_instructions: row['Dosage'] || row['dosage_instructions'],
                application_method: row['Application Method'] || row['application_method'],
                safety_precautions: row['Safety'] || row['safety_precautions'],
                minimum_stock_level: parseInt(row['Min Stock'] || '10'),
                reorder_point: parseInt(row['Reorder Point'] || '20')
              };

              const { error } = await supabase
                .from('products')
                .insert(productData);

              if (error) throw error;
              successful++;
            } catch (error: any) {
              failed++;
              errors.push({
                row: i + 2, // +2 because Excel rows start at 1 and header is row 1
                field: 'general',
                message: error.message || 'Failed to import product'
              });
            }
          }

          setImportResult({
            total: jsonData.length,
            successful,
            failed,
            errors
          });

          toast({
            title: 'Import completed',
            description: `${successful} products imported successfully, ${failed} failed`,
            variant: failed > 0 ? 'destructive' : 'default'
          });
        }
      };
      reader.readAsBinaryString(selectedFile);
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'An error occurred during import',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Create sample data for the template
    const templateData = [
      {
        'Product Name': 'Organic NPK Fertilizer',
        'SKU': 'NPK-001',
        'Brand': 'GreenGrow',
        'Category ID': 'fertilizer',
        'Product Type': 'fertilizer',
        'Price': 450,
        'Stock': 100,
        'Unit Type': 'kg',
        'Status': 'in_stock',
        'Active': 'true',
        'Featured': 'false',
        'Organic': 'true',
        'Active Ingredients': 'Nitrogen,Phosphorus,Potassium',
        'Suitable Crops': 'Rice,Wheat,Corn',
        'Dosage': '50kg per acre',
        'Application Method': 'Broadcasting',
        'Safety': 'Wear gloves and mask',
        'Min Stock': 20,
        'Reorder Point': 30
      },
      {
        'Product Name': 'Bio Pesticide Spray',
        'SKU': 'PEST-002',
        'Brand': 'SafeCrop',
        'Category ID': 'pesticide',
        'Product Type': 'pesticide',
        'Price': 780,
        'Stock': 50,
        'Unit Type': 'litre',
        'Status': 'in_stock',
        'Active': 'true',
        'Featured': 'true',
        'Organic': 'false',
        'Active Ingredients': 'Cypermethrin,Deltamethrin',
        'Suitable Crops': 'Cotton,Vegetables',
        'Dosage': '2ml per litre of water',
        'Application Method': 'Foliar spray',
        'Safety': 'Do not spray during flowering',
        'Min Stock': 10,
        'Reorder Point': 15
      },
      {
        'Product Name': 'Hybrid Tomato Seeds',
        'SKU': 'SEED-003',
        'Brand': 'Premium Seeds',
        'Category ID': 'seeds',
        'Product Type': 'seed',
        'Price': 250,
        'Stock': 200,
        'Unit Type': 'packet',
        'Status': 'in_stock',
        'Active': 'true',
        'Featured': 'false',
        'Organic': 'false',
        'Active Ingredients': '',
        'Suitable Crops': 'Tomato',
        'Dosage': '10g per acre',
        'Application Method': 'Direct sowing',
        'Safety': 'Store in cool, dry place',
        'Min Stock': 50,
        'Reorder Point': 75
      }
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    // Save the file
    XLSX.writeFile(wb, 'product_import_template.xlsx');

    toast({
      title: 'Template downloaded',
      description: 'Use this template to prepare your product data for import',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudUpload className="h-5 w-5" />
            Enhanced Bulk Import
          </CardTitle>
          <CardDescription>
            Import your agricultural products from CSV or Excel files with comprehensive validation
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="preview">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="results">
            <BarChart3 className="mr-2 h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Import Instructions</AlertTitle>
            <AlertDescription>
              Upload CSV or Excel files containing your product data. Download our template for the correct format.
              Supported formats: .csv, .xlsx, .xls
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Download Template Button */}
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Need a template?</p>
                    <p className="text-sm text-muted-foreground">
                      Download our Excel template with sample data and correct column headers
                    </p>
                  </div>
                  <Button onClick={downloadTemplate} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>

                {/* File Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                    className="hidden"
                  />
                  
                  <CloudUpload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">
                    {selectedFile ? selectedFile.name : 'Drop your file here or click to browse'}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Supports CSV and Excel files (max 10MB)
                  </p>
                  
                  <Button
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                    variant={selectedFile ? "outline" : "default"}
                  >
                    {selectedFile ? 'Change File' : 'Select File'}
                  </Button>
                </div>

                {/* Import Button */}
                {selectedFile && (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewData([]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={processImport}
                      disabled={isImporting}
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Start Import
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Import Progress */}
          {isImporting && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Import Progress</span>
                    <span className="text-sm text-muted-foreground">{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                  <p className="text-sm text-muted-foreground">
                    Processing your products... Please don't close this window.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {previewData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>File Preview</CardTitle>
                <CardDescription>
                  First 5 rows of your uploaded file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          {previewData[0] && previewData[0].map((header: any, index: number) => (
                            <th key={index} className="text-left p-2 font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(1).map((row: any[], rowIndex: number) => (
                          <tr key={rowIndex} className="border-b">
                            {row.map((cell: any, cellIndex: number) => (
                              <td key={cellIndex} className="p-2">
                                {cell || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No file uploaded yet. Upload a file to preview its contents.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {importResult ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <Package className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{importResult.total}</p>
                        <p className="text-sm text-muted-foreground">Total Products</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{importResult.successful}</p>
                        <p className="text-sm text-muted-foreground">Successful</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-500/10 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{importResult.failed}</p>
                        <p className="text-sm text-muted-foreground">Failed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Error Details */}
              {importResult.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Import Errors
                    </CardTitle>
                    <CardDescription>
                      Review and fix these errors before re-importing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-start gap-2">
                              <Badge variant="destructive" className="mt-0.5">
                                Row {error.row}
                              </Badge>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{error.field}</p>
                                <p className="text-sm text-muted-foreground">{error.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportResult(null);
                    setSelectedFile(null);
                    setPreviewData([]);
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Import Another File
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No import results yet. Complete an import to see the results here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}