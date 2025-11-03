import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export interface AIInsight {
  id: string;
  tenant_id: string;
  insight_type: 'security' | 'performance' | 'cost' | 'engagement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation?: string;
  impact_score: number;
  data_source?: any;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
}

export const useAIInsights = () => {
  const { getTenantId } = useTenantIsolation();
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['ai-insights', getTenantId()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('tenant_id', getTenantId())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AIInsight[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const resolveInsight = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('ai_insights')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq('id', insightId)
        .eq('tenant_id', getTenantId());

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights', getTenantId()] });
      toast.success('Insight marked as resolved');
    },
    onError: () => {
      toast.error('Failed to resolve insight');
    },
  });

  const generateInsights = useMutation({
    mutationFn: async () => {
      // Generate insights based on analytics data
      const analytics = await queryClient.fetchQuery({
        queryKey: ['organization-analytics', getTenantId()],
      });

      const newInsights: Array<{
        tenant_id: string;
        insight_type: string;
        priority: string;
        title: string;
        description: string;
        recommendation?: string;
        impact_score?: number;
        data_source?: any;
      }> = [];

      // Example insights generation logic
      if (analytics) {
        const { total_farmers, active_farmers, engagement_rate, storage_used_mb } = analytics as any;

        // Low engagement insight
        if (engagement_rate < 30) {
          newInsights.push({
            tenant_id: getTenantId(),
            insight_type: 'engagement',
            priority: 'high',
            title: 'Low Farmer Engagement Rate',
            description: `Your farmer engagement rate is ${engagement_rate}%, which is below the optimal 50% threshold.`,
            recommendation: 'Consider launching targeted campaigns, improving app features, or providing training to farmers.',
            impact_score: 85,
            data_source: { engagement_rate, total_farmers },
          });
        }

        // Inactive farmers insight
        const inactiveFarmers = total_farmers - active_farmers;
        if (inactiveFarmers > total_farmers * 0.3) {
          newInsights.push({
            tenant_id: getTenantId(),
            insight_type: 'performance',
            priority: 'medium',
            title: 'High Inactive Farmer Count',
            description: `${inactiveFarmers} farmers (${Math.round((inactiveFarmers / total_farmers) * 100)}%) are currently inactive.`,
            recommendation: 'Run a re-engagement campaign or contact inactive farmers to understand barriers.',
            impact_score: 70,
            data_source: { inactive_farmers: inactiveFarmers, total_farmers },
          });
        }

        // Storage optimization insight
        if (storage_used_mb > 5000) {
          newInsights.push({
            tenant_id: getTenantId(),
            insight_type: 'cost',
            priority: 'medium',
            title: 'High Storage Usage',
            description: `Your organization is using ${storage_used_mb}MB of storage.`,
            recommendation: 'Archive old data or optimize file uploads to reduce storage costs.',
            impact_score: 60,
            data_source: { storage_used_mb },
          });
        }
      }

      // Insert insights
      if (newInsights.length > 0) {
        const { error } = await supabase.from('ai_insights').insert(newInsights as any);
        if (error) throw error;
      }

      return newInsights.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights', getTenantId()] });
      toast.success(`Generated ${count} new insights`);
    },
    onError: () => {
      toast.error('Failed to generate insights');
    },
  });

  const unresolvedInsights = insights?.filter((i) => !i.is_resolved) || [];
  const criticalInsights = unresolvedInsights.filter((i) => i.priority === 'critical');
  const highPriorityInsights = unresolvedInsights.filter((i) => i.priority === 'high');

  return {
    insights,
    unresolvedInsights,
    criticalInsights,
    highPriorityInsights,
    isLoading,
    error,
    resolveInsight: resolveInsight.mutate,
    generateInsights: generateInsights.mutate,
    isGenerating: generateInsights.isPending,
  };
};
