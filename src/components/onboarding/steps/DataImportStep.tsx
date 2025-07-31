
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, CheckCircle, FileSpreadsheet, Database } from 'lucide-react';
import { OnboardingStep } from '@/services/OnboardingService';

interface DataImportStepProps {
  step: OnboardingStep;
  onComplete: (stepData?: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

export const DataImportStep: React.FC<DataImportStepProps> = ({
  step,
  onComplete,
  isLoading
}) => {
  const [importMethod, setImportMethod] = useState(step.step_data?.importMethod || 'skip');
  const [uploadedFiles, setUploadedFiles] = useState(step.step_data?.uploadedFiles || []);

  const handleContinue = () => {
    onComplete({ 
      importMethod, 
      uploadedFiles,
      timestamp: new Date().toISOString()
    });
  };

  const handleSkip = () => {
    onComplete({ 
      importMethod: 'skip', 
      skipped: true,
      timestamp: new Date().toISOString()
    });
  };

  if (step.step_status === 'completed') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Data Import Complete</h3>
        <p className="text-muted-foreground">
          {step.step_data?.skipped 
            ? "You've chosen to skip data import for now. You can import data later from settings."
            : `Data import configured using ${step.step_data?.importMethod} method.`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Import Your Data</h3>
        <p className="text-muted-foreground">
          Import existing farmer and product data, or start fresh. This step is optional.
        </p>
      </div>

      <Tabs value={importMethod} onValueChange={setImportMethod} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="excel">Excel Import</TabsTrigger>
          <TabsTrigger value="api">API Integration</TabsTrigger>
          <TabsTrigger value="skip">Start Fresh</TabsTrigger>
        </TabsList>

        <TabsContent value="excel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Excel/CSV Import
              </CardTitle>
              <CardDescription>
                Upload your data using Excel or CSV files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Farmer Data</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Upload farmer information (Excel/CSV)
                  </p>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                </div>
                
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Product Data</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Upload product catalog (Excel/CSV)
                  </p>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Download templates: 
                </span>
                <Button variant="link" size="sm" className="p-0 h-auto">
                  Farmer Template
                </Button>
                <span className="text-muted-foreground">|</span>
                <Button variant="link" size="sm" className="p-0 h-auto">
                  Product Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                API Integration
              </CardTitle>
              <CardDescription>
                Connect with your existing systems via API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Available Integrations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-background rounded border">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <Database className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">REST API</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background rounded border">
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">Google Sheets</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                API integration requires technical setup. Our team will help you configure the connection.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Start Fresh</CardTitle>
              <CardDescription>
                Begin with a clean slate and add data manually as you go
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">You can always import data later</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Add farmers one by one through the dashboard</li>
                  <li>• Bulk import via Excel/CSV from settings</li>
                  <li>• Set up API integrations when ready</li>
                  <li>• Import historical data at any time</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleSkip}
          disabled={isLoading}
        >
          Skip for Now
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={isLoading}
          className="min-w-32"
        >
          {isLoading ? 'Processing...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
