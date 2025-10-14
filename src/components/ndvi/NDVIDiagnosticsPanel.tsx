import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  XCircle,
  Info,
  Trash2,
  RotateCcw,
  Activity,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { ndviVerificationService } from '@/services/NDVIDataVerificationService';
import { toast } from 'sonner';

export const NDVIDiagnosticsPanel: React.FC = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const runDiagnostics = async () => {
    if (!currentTenant?.id) return;
    
    setIsVerifying(true);
    try {
      const result = await ndviVerificationService.verifyNDVIDataFlow(currentTenant.id);
      setDiagnostics(result);
      
      if (result.hasData) {
        toast.success('NDVI data flow verified successfully');
      } else if (result.issues.length > 0) {
        toast.warning(`Found ${result.issues.length} issue(s)`);
      }
    } catch (error: any) {
      toast.error(`Diagnostics failed: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const resetStuckItems = async () => {
    if (!currentTenant?.id) return;
    
    setIsResetting(true);
    try {
      const count = await ndviVerificationService.resetStuckItems(currentTenant.id);
      toast.success(`Reset ${count} stuck item(s)`);
      await runDiagnostics(); // Re-run diagnostics
    } catch (error: any) {
      toast.error(`Reset failed: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const clearOldItems = async () => {
    if (!currentTenant?.id) return;
    
    setIsCleaning(true);
    try {
      const count = await ndviVerificationService.clearOldFailedItems(currentTenant.id);
      toast.success(`Cleared ${count} old item(s)`);
      await runDiagnostics(); // Re-run diagnostics
    } catch (error: any) {
      toast.error(`Cleanup failed: ${error.message}`);
    } finally {
      setIsCleaning(false);
    }
  };

  React.useEffect(() => {
    if (currentTenant?.id) {
      runDiagnostics();
    }
  }, [currentTenant?.id]);

  if (!diagnostics && !isVerifying) {
    return null;
  }

  return (
    <Card className="border-muted/50 shadow-lg">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              NDVI Data Diagnostics
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time health check of your NDVI processing pipeline
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runDiagnostics}
            disabled={isVerifying}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isVerifying && !diagnostics ? (
          <div className="py-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Running diagnostics...</p>
          </div>
        ) : diagnostics ? (
          <>
            {/* Status Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">NDVI Records</p>
                <p className="text-2xl font-bold">{diagnostics.ndviDataCount}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Micro Tiles</p>
                <p className="text-2xl font-bold">{diagnostics.microTilesCount}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Queued</p>
                <p className="text-2xl font-bold text-yellow-600">{diagnostics.queueStatus.queued}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{diagnostics.queueStatus.completed}</p>
              </div>
            </div>

            {/* Health Status */}
            {diagnostics.hasData ? (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900 dark:text-green-100">
                  Data Flow Healthy
                </AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200">
                  NDVI data is being successfully processed and stored.
                  {diagnostics.recentData.ndviRecords.length > 0 && (
                    <span className="block mt-2">
                      Latest: {new Date(diagnostics.recentData.ndviRecords[0].created_at).toLocaleString()}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-900 dark:text-yellow-100">
                  No NDVI Data Found
                </AlertTitle>
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  No records found in ndvi_data or ndvi_micro_tiles tables.
                </AlertDescription>
              </Alert>
            )}

            {/* Issues */}
            {diagnostics.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  Issues Detected ({diagnostics.issues.length})
                </h4>
                <div className="space-y-2">
                  {diagnostics.issues.map((issue: string, i: number) => (
                    <Alert key={i} variant="destructive" className="py-3">
                      <AlertDescription className="text-sm">
                        {issue}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {diagnostics.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  Recommendations ({diagnostics.recommendations.length})
                </h4>
                <div className="space-y-2">
                  {diagnostics.recommendations.map((rec: string, i: number) => (
                    <Alert key={i} className="py-3 border-blue-500/50 bg-blue-500/10">
                      <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                        {rec}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {(diagnostics.queueStatus.queued > 0 || diagnostics.queueStatus.failed > 0) && (
              <div className="flex flex-wrap gap-3">
                {diagnostics.queueStatus.queued > 0 && (
                  <Button
                    variant="outline"
                    onClick={resetStuckItems}
                    disabled={isResetting}
                  >
                    <RotateCcw className={`w-4 h-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
                    Reset Stuck Items ({diagnostics.queueStatus.queued})
                  </Button>
                )}
                
                {diagnostics.queueStatus.failed > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearOldItems}
                    disabled={isCleaning}
                  >
                    <Trash2 className={`w-4 h-4 mr-2 ${isCleaning ? 'animate-spin' : ''}`} />
                    Clear Failed Items ({diagnostics.queueStatus.failed})
                  </Button>
                )}
              </div>
            )}

            {/* Queue Details */}
            {diagnostics.queueStatus.queued > 0 && (
              <Alert className="border-primary/50 bg-primary/5">
                <Info className="h-4 w-4" />
                <AlertTitle>Queue Status</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>📋 {diagnostics.queueStatus.queued} items waiting for processing</p>
                    <p>⚙️ {diagnostics.queueStatus.processing} items currently processing</p>
                    <p className="text-muted-foreground mt-2">
                      Note: Items are processed by the Python worker cron job running on Render.
                      Processing typically completes within 2-5 minutes.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : null}
      </div>
    </Card>
  );
};
