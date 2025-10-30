import React from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Info, Activity } from 'lucide-react';
import { useNDVIApiMonitoring } from '@/hooks/data/useNDVIApiMonitoring';

export const NDVIDiagnosticsPanel: React.FC = () => {
  const { globalStats, dataSummary } = useNDVIApiMonitoring();

  // v4.1.0 API: dataSummary = {status, count, data: [...]}
  // v4.1.0 API: globalStats = {status, tenant_id, stats: {total_requests, queued, processing, completed, failed}}
  const hasData = (dataSummary as any)?.count > 0;
  const stats = (globalStats as any)?.stats || {};
  const queuedCount = stats.queued || 0;
  const processingCount = stats.processing || 0;
  const completedCount = stats.completed || 0;
  const failedCount = stats.failed || 0;
  const totalRequests = stats.total_requests || 0;

  return (
    <Card className="border-muted/50 shadow-lg">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Processing Queue Status
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time queue and data status from API
            </p>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">NDVI Records</p>
            <p className="text-2xl font-bold">{(dataSummary as any)?.count || 0}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Queued</p>
            <p className="text-2xl font-bold text-yellow-600">{queuedCount}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Processing</p>
            <p className="text-2xl font-bold text-blue-600">{processingCount}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          </div>
        </div>

        {/* Health Status */}
        {hasData ? (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900 dark:text-green-100">
              NDVI Data Available
            </AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              {(dataSummary as any)?.count} NDVI records found. System is operational.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-900 dark:text-yellow-100">
              No NDVI Data Yet
            </AlertTitle>
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              Add farmers with land parcels and click "Queue NDVI & Refresh" to start monitoring.
            </AlertDescription>
          </Alert>
        )}

        {/* Queue Info */}
        {(queuedCount > 0 || processingCount > 0) && (
          <Alert className="border-primary/50 bg-primary/5">
            <Info className="h-4 w-4" />
            <AlertTitle>Processing In Progress</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1 text-sm">
                {queuedCount > 0 && <p>📋 {queuedCount} items queued</p>}
                {processingCount > 0 && <p>⚙️ {processingCount} items processing</p>}
                <p className="text-muted-foreground mt-2">
                  Processing typically completes within 2-5 minutes. Refresh to see updates.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Failed Items Warning */}
        {failedCount > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Processing Errors Detected</AlertTitle>
            <AlertDescription>
              {failedCount} requests failed. Check the System tab for details and retry.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
};
