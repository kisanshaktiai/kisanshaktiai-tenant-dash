
import { QueryClient } from '@tanstack/react-query';
import type { AnalyticsFilters } from '@/types/analytics';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  // Auth
  user: ['user'] as const,
  
  // Tenants
  tenants: (userId: string) => ['tenants', userId] as const,
  tenant: (tenantId: string) => ['tenant', tenantId] as const,
  
  // Farmers
  farmers: (tenantId: string) => ['farmers', tenantId] as const,
  farmer: (farmerId: string) => ['farmer', farmerId] as const,
  
  // Products
  products: (tenantId: string) => ['products', tenantId] as const,
  product: (productId: string) => ['product', productId] as const,
  
  // Dealers
  dealers: (tenantId: string) => ['dealers', tenantId] as const,
  dealer: (dealerId: string) => ['dealer', dealerId] as const,
  
  // Campaigns
  campaigns: (tenantId: string) => ['campaigns', tenantId] as const,
  campaign: (campaignId: string) => ['campaign', campaignId] as const,
  
  // Dashboard
  dashboardStats: (tenantId: string) => ['dashboard', 'stats', tenantId] as const,
  
  // Analytics
  engagementStats: (tenantId: string) => ['analytics', 'engagement', tenantId] as const,
  executiveDashboard: (tenantId: string, filters?: AnalyticsFilters) => 
    ['analytics', 'executive', tenantId, filters] as const,
  farmerAnalytics: (tenantId: string, filters?: AnalyticsFilters) => 
    ['analytics', 'farmers', tenantId, filters] as const,
  productAnalytics: (tenantId: string, filters?: AnalyticsFilters) => 
    ['analytics', 'products', tenantId, filters] as const,
  customReports: (tenantId: string) => ['analytics', 'reports', tenantId] as const,
  predictiveAnalytics: (tenantId: string, modelType?: string) => 
    ['analytics', 'predictive', tenantId, modelType] as const,
  exportLogs: (tenantId: string) => ['analytics', 'exports', tenantId] as const,
  
  // Onboarding
  onboardingWorkflow: (tenantId: string) => ['onboarding', 'workflow', tenantId] as const,
  onboardingStep: (stepId: string) => ['onboarding', 'step', stepId] as const,
} as const;
