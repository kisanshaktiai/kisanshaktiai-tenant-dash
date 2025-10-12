import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Play, 
  RefreshCw,
  Activity,
  Server,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { renderNDVIService, HealthStatus, JobRunResponse } from '@/services/RenderNDVIService';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';

export const RenderServiceStatus: React.FC = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isTriggeringJobs, setIsTriggeringJobs] = useState(false);
  const [jobLimit, setJobLimit] = useState(10);
  const [useQueue, setUseQueue] = useState(true);
  const [lastJobResponse, setLastJobResponse] = useState<JobRunResponse | null>(null);

  // Auto-check health on mount
  useEffect(() => {
    checkServiceHealth();
    
    // Set up periodic health check every 30 seconds
    const interval = setInterval(() => {
      checkServiceHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkServiceHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const health = await renderNDVIService.checkHealth();
      setHealthStatus(health);
      setIsHealthy(health.status === 'healthy' || health.status === 'ok');
      toast.success('Service is healthy');
    } catch (error) {
      setIsHealthy(false);
      setHealthStatus(null);
      toast.error('Service is unavailable');
      console.error('Health check failed:', error);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const triggerProcessingJobs = async () => {
    if (!currentTenant?.id) {
      toast.error('No tenant selected');
      return;
    }

    setIsTriggeringJobs(true);
    try {
      const response = await renderNDVIService.triggerJobs(jobLimit);

      setLastJobResponse(response);
      
      toast.success(
        `Worker started successfully`,
        {
          description: `Processing ${response.limit} jobs. Status: ${response.status}`
        }
      );
    } catch (error: any) {
      toast.error('Failed to trigger jobs', {
        description: error.message || 'Unknown error occurred'
      });
      console.error('Job trigger error:', error);
    } finally {
      setIsTriggeringJobs(false);
    }
  };

  const getStatusBadge = () => {
    if (isHealthy === null) {
      return <Badge variant="outline">Unknown</Badge>;
    }
    
    if (isHealthy) {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Online
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
        <XCircle className="w-3 h-3 mr-1" />
        Offline
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Service Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Render Service Status
              </CardTitle>
              <CardDescription>
                FastAPI NDVI Processing Service
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Service Endpoint</span>
              </div>
              <a 
                href="https://ndvi-land-api.onrender.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                https://ndvi-land-api.onrender.com
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkServiceHealth}
              disabled={isCheckingHealth}
            >
              {isCheckingHealth ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </>
              )}
            </Button>
          </div>

          {healthStatus && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="text-lg font-semibold capitalize">{healthStatus.status}</div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Timestamp</div>
                <div className="text-lg font-semibold">{new Date(healthStatus.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          )}

          {!isHealthy && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Service Unavailable</AlertTitle>
              <AlertDescription>
                The NDVI processing service is currently offline. Please check the Render dashboard or try again later.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Job Trigger Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Trigger Processing Jobs
          </CardTitle>
          <CardDescription>
            Manually trigger NDVI processing jobs via the Render service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobLimit">Job Limit</Label>
              <Input
                id="jobLimit"
                type="number"
                min="1"
                max="100"
                value={jobLimit}
                onChange={(e) => setJobLimit(parseInt(e.target.value) || 10)}
                placeholder="Number of jobs to process"
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of jobs to trigger (1-100)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="useQueue">Processing Mode</Label>
              <div className="flex items-center gap-2 h-10">
                <input
                  id="useQueue"
                  type="checkbox"
                  checked={useQueue}
                  onChange={(e) => setUseQueue(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="useQueue" className="cursor-pointer">
                  Use Queue System
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Queue jobs for distributed processing
              </p>
            </div>
          </div>

          <Button
            onClick={triggerProcessingJobs}
            disabled={!isHealthy || isTriggeringJobs}
            className="w-full"
            size="lg"
          >
            {isTriggeringJobs ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Triggering Jobs...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Trigger Jobs (Limit: {jobLimit})
              </>
            )}
          </Button>

          {lastJobResponse && (
            <Alert className={lastJobResponse.success ? "border-success" : "border-destructive"}>
              {lastJobResponse.success ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <AlertTitle>
                {lastJobResponse.success ? 'Jobs Triggered Successfully' : 'Job Trigger Failed'}
              </AlertTitle>
              <AlertDescription>
                {lastJobResponse.message}
                {lastJobResponse.jobs_triggered > 0 && (
                  <div className="mt-2 font-semibold">
                    {lastJobResponse.jobs_triggered} job(s) triggered
                  </div>
                )}
                {lastJobResponse.job_ids && lastJobResponse.job_ids.length > 0 && (
                  <div className="mt-2 text-xs">
                    Job IDs: {lastJobResponse.job_ids.slice(0, 5).join(', ')}
                    {lastJobResponse.job_ids.length > 5 && ` +${lastJobResponse.job_ids.length - 5} more`}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Service Information */}
      <Card>
        <CardHeader>
          <CardTitle>Service Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-32 text-muted-foreground">Entrypoint:</div>
            <div className="font-mono">ndvi_land_api:app</div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-32 text-muted-foreground">Runtime:</div>
            <div>Uvicorn on port 10000</div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-32 text-muted-foreground">Environment:</div>
            <div>sentinel-fetch-env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, B2_BUCKET_URL)</div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-32 text-muted-foreground">Endpoints:</div>
            <div className="space-y-1">
              <div>• GET /health - Health check</div>
              <div>• POST /run - Trigger processing jobs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
