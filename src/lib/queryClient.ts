
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  // Tenant-related queries
  tenants: (userId?: string) => ['tenants', userId] as const,
  tenant: (tenantId: string) => ['tenant', tenantId] as const,
  tenantSettings: (tenantId: string) => ['tenant-settings', tenantId] as const,
  tenantBranding: (tenantId: string) => ['tenant-branding', tenantId] as const,
  tenantFeatures: (tenantId: string) => ['tenant-features', tenantId] as const,
  
  // Farmer-related queries
  farmers: (tenantId: string, options?: any) => ['farmers', tenantId, options] as const,
  farmersList: (tenantId: string, options?: any) => ['farmers-list', tenantId, options] as const,
  farmer: (farmerId: string, tenantId: string) => ['farmer', farmerId, tenantId] as const,
  farmerStats: (tenantId: string) => ['farmer-stats', tenantId] as const,
  farmerEngagement: (tenantId: string, farmerId?: string) => ['farmer-engagement', tenantId, farmerId] as const,
  farmerTags: (tenantId: string, farmerId?: string) => ['farmer-tags', tenantId, farmerId] as const,
  farmerNotes: (farmerId: string, tenantId: string) => ['farmer-notes', farmerId, tenantId] as const,
  farmerSegments: (tenantId: string) => ['farmer-segments', tenantId] as const,
  advancedFarmerSearch: (tenantId: string, params: any) => ['advanced-farmer-search', tenantId, params] as const,
  communicationHistory: (farmerId: string, tenantId: string) => ['communication-history', farmerId, tenantId] as const,
  
  // Dealer-related queries
  dealers: (tenantId: string, options?: any) => ['dealers', tenantId, options] as const,
  dealersList: (tenantId: string, options?: any) => ['dealers-list', tenantId, options] as const,
  dealer: (dealerId: string, tenantId: string) => ['dealer', dealerId, tenantId] as const,
  dealerPerformance: (dealerId: string, tenantId: string) => ['dealer-performance', dealerId, tenantId] as const,
  
  // Product-related queries
  products: (tenantId: string, options?: any) => ['products', tenantId, options] as const,
  productsList: (tenantId: string, options?: any) => ['products-list', tenantId, options] as const,
  product: (productId: string, tenantId: string) => ['product', productId, tenantId] as const,
  productCategories: (tenantId: string) => ['product-categories', tenantId] as const,
  
  // Campaign-related queries
  campaigns: (tenantId: string, options?: any) => ['campaigns', tenantId, options] as const,
  campaign: (campaignId: string, tenantId: string) => ['campaign', campaignId, tenantId] as const,
  campaignAnalytics: (campaignId: string, tenantId: string) => ['campaign-analytics', campaignId, tenantId] as const,
  
  // Analytics queries
  analytics: (tenantId: string, type?: string, params?: any) => ['analytics', tenantId, type, params] as const,
  engagementStats: (tenantId: string) => ['engagement-stats', tenantId] as const,
  dashboardStats: (tenantId: string) => ['dashboard-stats', tenantId] as const,
  
  // Onboarding queries
  onboardingWorkflow: (tenantId: string) => ['onboarding-workflow', tenantId] as const,
  onboardingSteps: (workflowId: string, tenantId: string) => ['onboarding-steps', workflowId, tenantId] as const,
  
  // System queries
  subscriptionPlans: () => ['subscription-plans'] as const,
  systemConfig: () => ['system-config'] as const,
} as const;
