import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Satellite, Loader2, CheckCircle2, Clock, AlertCircle, Zap } from 'lucide-react';
import { useAutoNDVIAnalysis } from '@/hooks/data/useAutoNDVIAnalysis';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const NDVIAnalysisButton: React.FC = () => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const {
    landsNeedingUpdate,
    landsCount,
    isLoading: isCheckingLands,
    createAutoRequest,
    isCreating,
  } = useAutoNDVIAnalysis();

  // Determine if instant processing will be used (≤5 lands)
  const willUseInstantProcessing = landsCount > 0 && landsCount <= 5;

  const handleAnalyze = async () => {
    try {
      await createAutoRequest.mutateAsync();
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Failed to create NDVI analysis requests:', error);
    }
  };

  return (
    <>
      {/* Single Smart Button */}
      <Button
        onClick={() => setShowConfirmDialog(true)}
        disabled={isCheckingLands || isCreating || landsCount === 0}
        size="lg"
        className="gap-2 relative overflow-hidden"
      >
        {isCheckingLands ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking lands...
          </>
        ) : isCreating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {willUseInstantProcessing ? 'Processing...' : 'Queueing...'}
          </>
        ) : (
          <>
            <Satellite className="w-4 h-4" />
            🛰️ Analyze Vegetation Health
            {landsCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-white/20">
                {landsCount}
              </Badge>
            )}
          </>
        )}
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Satellite className="w-5 h-5 text-primary" />
              Start NDVI Analysis?
            </DialogTitle>
            <DialogDescription>
              Review the lands that will be analyzed for vegetation health monitoring
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isCheckingLands ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : landsCount === 0 ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  All lands have recent NDVI data (updated within 24 hours). No analysis needed right now.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Processing Mode Explanation */}
                <Alert className={willUseInstantProcessing ? 'border-primary bg-primary/5' : 'border-blue-500/50 bg-blue-500/5'}>
                  {willUseInstantProcessing ? (
                    <Zap className="h-4 w-4 text-primary" />
                  ) : (
                    <Clock className="h-4 w-4 text-blue-500" />
                  )}
                  <AlertDescription>
                    {willUseInstantProcessing ? (
                      <div>
                        <strong className="text-primary">⚡ Instant Processing Mode</strong>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Small batch detected ({landsCount} land{landsCount !== 1 ? 's' : ''}). 
                          Processing will happen immediately and typically takes 1-2 minutes per land.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <strong className="text-blue-700 dark:text-blue-400">📋 Queued Processing Mode</strong>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Large batch detected ({landsCount} lands). 
                          Analysis will be queued for background processing to ensure optimal performance.
                        </p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>

                {/* Lands Info */}
                <Alert>
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <AlertDescription>
                    <strong>{landsCount} land{landsCount !== 1 ? 's' : ''}</strong> require NDVI updates:
                    <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>New lands (created within last 7 days)</li>
                      <li>Lands with data older than 24 hours</li>
                      <li>Lands never processed</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Details Card */}
                <div className="rounded-lg border p-4 bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Analysis Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Lands to process: {landsCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Satellite className="w-4 h-4 text-muted-foreground" />
                      <span>Auto-detected tiles</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      {willUseInstantProcessing ? (
                        <>
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="text-primary font-medium">
                            Estimated time: {landsCount * 2} minutes
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-blue-700 dark:text-blue-400">
                            Processing time: 5-10 minutes
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={isCreating || landsCount === 0}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {willUseInstantProcessing ? 'Processing...' : 'Queueing...'}
                </>
              ) : (
                <>
                  {willUseInstantProcessing ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      ⚡ Analyze Now
                    </>
                  ) : (
                    <>
                      <Satellite className="w-4 h-4 mr-2" />
                      Start Analysis
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
