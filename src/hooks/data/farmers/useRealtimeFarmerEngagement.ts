/**
 * Farmer Engagement Hook with Real-time Updates
 */

import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { TenantDataService } from '@/services/core/TenantDataService';
import { useRealtimeTenantData } from '../useRealtimeTenantData';
import { queryKeys } from '@/lib/queryClient';

export interface FarmerEngagement {
  id: string;
  tenant_id: string;
  farmer_id: string;
  engagement_type: string;
  engagement_date: string;
  channel?: string;
  response_status?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface EngagementMetrics {
  totalEngagements: number;
  lastEngagement: Date | null;
  engagementScore: number;
  channelBreakdown: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

export const useRealtimeFarmerEngagement = (farmerId?: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const tenantId = currentTenant?.id || '';
  
  const queryKey = queryKeys.farmerEngagement(tenantId, farmerId);
  
  const realtimeStatus = useRealtimeTenantData({
    tableName: 'engagements',
    tenantId,
    queryKey,
    enabled: !!tenantId
  });

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const engagements = await TenantDataService.fetchTenantTableData<FarmerEngagement>(
        'engagements',
        tenantId,
        {
          filters: farmerId ? { farmer_id: farmerId } : {},
          sortBy: 'engagement_date',
          sortOrder: 'desc',
          limit: 1000
        }
      );

      // Calculate metrics
      const metrics: EngagementMetrics = {
        totalEngagements: engagements.count,
        lastEngagement: engagements.data[0]?.engagement_date 
          ? new Date(engagements.data[0].engagement_date) 
          : null,
        engagementScore: calculateEngagementScore(engagements.data),
        channelBreakdown: calculateChannelBreakdown(engagements.data),
        monthlyTrend: calculateMonthlyTrend(engagements.data)
      };

      return {
        engagements: engagements.data,
        metrics
      };
    },
    enabled: !!tenantId,
    staleTime: realtimeStatus.isConnected ? 30000 : 5000,
  });

  return {
    ...query,
    realtimeStatus
  };
};

function calculateEngagementScore(engagements: FarmerEngagement[]): number {
  if (engagements.length === 0) return 0;
  
  const recentEngagements = engagements.filter(e => {
    const engDate = new Date(e.engagement_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return engDate > thirtyDaysAgo;
  });

  // Simple scoring: more recent engagements = higher score
  const baseScore = Math.min(100, recentEngagements.length * 10);
  
  return Math.round(baseScore);
}

function calculateChannelBreakdown(engagements: FarmerEngagement[]): Record<string, number> {
  return engagements.reduce((acc, eng) => {
    const channel = eng.channel || 'unknown';
    acc[channel] = (acc[channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function calculateMonthlyTrend(engagements: FarmerEngagement[]): Array<{ month: string; count: number }> {
  const monthCounts = new Map<string, number>();
  
  engagements.forEach(eng => {
    const date = new Date(eng.engagement_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
  });

  return Array.from(monthCounts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6) // Last 6 months
    .map(([month, count]) => ({ month, count }));
}