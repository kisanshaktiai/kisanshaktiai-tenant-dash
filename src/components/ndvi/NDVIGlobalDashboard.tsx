import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Satellite, 
  Activity, 
  Database,
  Clock,
  Users,
  MapPin,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  CloudOff,
  TrendingUp,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { toast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface HarvestJob {
  id: string;
  status: string;
  job_id?: string;
  tile_id?: string;
  attempts?: number;
  priority?: number;
  created_at: string;
  updated_at?: string;
  next_retry_at?: string;
  last_attempt_at?: string;
  requested_date?: string;
}

interface QuotaInfo {
  can_harvest: boolean;
  current_usage: number;
  monthly_limit: number;
  remaining: number;
  percentage_used: number;
}

export const NDVIGlobalDashboard: React.FC = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<HarvestJob | null>(null);
  const [isHarvesting, setIsHarvesting] = useState(false);

  // Fetch quota information
  const { data: quotaInfo, refetch: refetchQuota } = useQuery({
    queryKey: ['ndvi-quota', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      
      // Use edge function to get quota status
      const { data, error } = await supabase.functions.invoke('ndvi-harvest', {
        body: {
          action: 'get_harvest_status',
          tenant_id: currentTenant.id
        }
      });
      
      if (error) throw error;
      
      // Default quota info if not available
      const quotaData = data?.quota || {
        can_harvest: true,
        current_usage: 0,
        monthly_limit: 100,
        remaining: 100
      };
      
      return {
        ...quotaData,
        percentage_used: (quotaData.current_usage / quotaData.monthly_limit) * 100
      };
    },
    enabled: !!currentTenant?.id,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch active harvest jobs
  const { data: harvestJobs, refetch: refetchJobs } = useQuery({
    queryKey: ['harvest-jobs', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      
      const { data, error } = await supabase
        .from('harvest_queue')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as HarvestJob[];
    },
    enabled: !!currentTenant?.id,
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Fetch system jobs (processing status)
  const { data: systemJobs } = useQuery({
    queryKey: ['system-jobs', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      
      const { data, error } = await supabase
        .from('system_jobs')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('job_type', 'ndvi_processing')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant?.id,
    refetchInterval: 5000 // Refresh every 5 seconds for real-time updates
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel(`ndvi-jobs-${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'harvest_queue',
          filter: `tenant_id=eq.${currentTenant.id}`
        },
        () => {
          refetchJobs();
          refetchQuota();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_jobs',
          filter: `tenant_id=eq.${currentTenant.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['system-jobs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, refetchJobs, refetchQuota, queryClient]);

  const handleBulkHarvest = async () => {
    if (!currentTenant?.id || !quotaInfo?.can_harvest) return;
    
    setIsHarvesting(true);
    try {
      const { error } = await supabase.functions.invoke('ndvi-harvest', {
        body: {
          action: 'trigger_harvest',
          tenant_id: currentTenant.id,
          harvest_all: true,
          source: 'MPC'
        }
      });

      if (error) throw error;
      
      toast({
        title: "Bulk Harvest Initiated",
        description: "Fetching satellite data for all farmers",
      });
      
      refetchJobs();
      refetchQuota();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate bulk harvest",
        variant: "destructive"
      });
    } finally {
      setIsHarvesting(false);
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-primary/10">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-success/10">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const activeJobs = harvestJobs?.filter(job => ['pending', 'processing'].includes(job.status)) || [];
  const completedJobs = harvestJobs?.filter(job => job.status === 'completed') || [];
  const failedJobs = harvestJobs?.filter(job => job.status === 'failed') || [];

  return (
    <div className="space-y-6">
      {/* Quota Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              NDVI Harvest Quota
            </CardTitle>
            <Button
              onClick={handleBulkHarvest}
              disabled={!quotaInfo?.can_harvest || isHarvesting}
            >
              {isHarvesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Harvesting...
                </>
              ) : (
                <>
                  <Satellite className="h-4 w-4 mr-2" />
                  Bulk Harvest All
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quotaInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Used</p>
                  <p className="text-2xl font-bold">{quotaInfo.current_usage}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Limit</p>
                  <p className="text-2xl font-bold">{quotaInfo.monthly_limit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold text-primary">{quotaInfo.remaining}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="font-medium">{quotaInfo.percentage_used.toFixed(1)}%</span>
                </div>
                <Progress value={quotaInfo.percentage_used} className="h-2" />
              </div>

              {!quotaInfo.can_harvest && (
                <Alert className="border-warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Quota Limit Reached</AlertTitle>
                  <AlertDescription>
                    You've reached your monthly NDVI harvest limit. Quota resets on the 1st of each month.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Loading quota information...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Jobs Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Processing Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeJobs.length > 0 ? (
            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getJobStatusIcon(job.status)}
                    <div>
                      <p className="font-medium">Harvest Job #{job.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        Started {format(new Date(job.created_at), 'HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                  {getJobStatusBadge(job.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CloudOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active processing jobs</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jobs History Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Processing History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({harvestJobs?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="processing">
                Processing ({activeJobs.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedJobs.length})
              </TabsTrigger>
              <TabsTrigger value="failed">
                Failed ({failedJobs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2">
              {harvestJobs && harvestJobs.length > 0 ? (
                harvestJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getJobStatusIcon(job.status)}
                      <div>
                        <p className="font-medium">Job #{job.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(job.created_at), 'MMM dd, HH:mm')}
                          {job.status === 'completed' && ` • Completed`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getJobStatusBadge(job.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedJob(job)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No jobs found</p>
              )}
            </TabsContent>

            <TabsContent value="processing" className="space-y-2">
              {activeJobs.length > 0 ? (
                activeJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      <div>
                        <p className="font-medium">Processing #{job.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Started {format(new Date(job.created_at), 'HH:mm:ss')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-primary/10">Processing</Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No active jobs</p>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-2">
              {completedJobs.length > 0 ? (
                completedJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <div>
                        <p className="font-medium">Completed #{job.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(job.created_at), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-success/10">Completed</Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No completed jobs</p>
              )}
            </TabsContent>

            <TabsContent value="failed" className="space-y-2">
              {failedJobs.length > 0 ? (
                failedJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <div>
                        <p className="font-medium">Failed #{job.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Processing failed
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive">Failed</Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No failed jobs</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};