import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, Download, CheckCircle, AlertCircle, 
  FileText, X, Check
} from 'lucide-react';

interface FarmerImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FarmerImportModal = ({ open, onOpenChange }: FarmerImportModalProps) => {
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    errors: []
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStep(2);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setStep(3);
          // Simulate processing results
          setImportResults({
            total: 145,
            successful: 132,
            failed: 13,
            errors: [
              'Row 5: Invalid phone number format',
              'Row 12: Missing required field: District',
              'Row 23: Duplicate farmer ID'
            ]
          });
        }
      }, 200);
    }
  };

  const downloadTemplate = () => {
    // In real app, this would download a CSV template
    const csvContent = 'Name,Phone,Email,Village,District,State,Land Size (Acres),Primary Crops\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'farmer_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetModal = () => {
    setStep(1);
    setUploadProgress(0);
    setImportResults({ total: 0, successful: 0, failed: 0, errors: [] });
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Farmers</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import farmer data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-primary text-white' : 'bg-muted'
              }`}>
                1
              </div>
              <span>Upload</span>
            </div>
            <div className="w-8 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-primary text-white' : 'bg-muted'
              }`}>
                2
              </div>
              <span>Process</span>
            </div>
            <div className="w-8 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-primary text-white' : 'bg-muted'
              }`}>
                {step >= 3 ? <Check className="h-4 w-4" /> : '3'}
              </div>
              <span>Results</span>
            </div>
          </div>

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Download Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download our CSV template to ensure your data is formatted correctly.
                  </p>
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV Template
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upload File</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Upload your CSV file</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Maximum file size: 10MB. Supported format: CSV
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload">
                      <Button asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Processing */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Import</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Uploading and validating data...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Please wait while we process your file...
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Results */}
          {step === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Import Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{importResults.total}</div>
                      <div className="text-sm text-muted-foreground">Total Records</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{importResults.successful}</div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">{importResults.failed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {importResults.failed > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      Import Errors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {importResults.errors.map((error, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <X className="h-4 w-4 text-destructive" />
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button onClick={handleClose}>Close</Button>
                <Button variant="outline" onClick={resetModal}>
                  Import Another File
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};