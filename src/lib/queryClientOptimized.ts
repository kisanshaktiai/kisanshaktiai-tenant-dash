import { QueryClient } from '@tanstack/react-query';

export const queryClientOptimized = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - keep existing
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // Don't retry for 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2; // Reduced from default 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Keep existing query keys but optimize cache time based on data volatility
export const queryKeys = {
  // Tenant-related queries (low volatility - cache longer)
  tenants: (userId?: string) => ['tenants', userId] as const,
  tenant: (tenantId: string) => ['tenant', tenantId] as const,
  tenantSettings: (tenantId: string) => ['tenant-settings', tenantId] as const,
  tenantBranding: (tenantId: string) => ['tenant-branding', tenantId] as const,
  tenantFeatures: (tenantId: string) => ['tenant-features', tenantId] as const,
  
  // Farmer-related queries (medium volatility)
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
  
  // Dealer-related queries (medium volatility)
  dealers: (tenantId: string, options?: any) => ['dealers', tenantId, options] as const,
  dealersList: (tenantId: string, options?: any) => ['dealers-list', tenantId, options] as const,
  dealer: (dealerId: string, tenantId: string) => ['dealer', dealerId, tenantId] as const,
  dealerPerformance: (dealerId: string, tenantId: string) => ['dealer-performance', dealerId, tenantId] as const,
  
  // Product-related queries (low volatility - cache longer)
  products: (tenantId: string, options?: any) => ['products', tenantId, options] as const,
  productsList: (tenantId: string, options?: any) => ['products-list', tenantId, options] as const,
  product: (productId: string, tenantId: string) => ['product', productId, tenantId] as const,
  productCategories: (tenantId: string) => ['product-categories', tenantId] as const,
  
  // Campaign-related queries (high volatility)
  campaigns: (tenantId: string, options?: any) => ['campaigns', tenantId, options] as const,
  campaign: (campaignId: string, tenantId: string) => ['campaign', campaignId, tenantId] as const,
  campaignAnalytics: (campaignId: string, tenantId: string) => ['campaign-analytics', campaignId, tenantId] as const,
  
  // Analytics queries (high volatility - shorter cache)
  analytics: (tenantId: string, type?: string, params?: any) => ['analytics', tenantId, type, params] as const,
  engagementStats: (tenantId: string) => ['engagement-stats', tenantId] as const,
  dashboardStats: (tenantId: string) => ['dashboard-stats', tenantId] as const,
  
  // Onboarding queries (medium volatility)
  onboardingWorkflow: (tenantId: string) => ['onboarding-workflow', tenantId] as const,
  onboardingSteps: (workflowId: string, tenantId: string) => ['onboarding-steps', workflowId, tenantId] as const,
  
  // System queries (very low volatility - cache much longer)
  subscriptionPlans: () => ['subscription-plans'] as const,
  systemConfig: () => ['system-config'] as const,
} as const;

// Helper function to get optimal cache time based on query type
export const getOptimalCacheTime = (queryKey: readonly unknown[]): number => {
  const key = queryKey[0] as string;
  
  // High volatility data - 1 minute
  if (key.includes('analytics') || key.includes('campaign') || key.includes('stats')) {
    return 1 * 60 * 1000;
  }
  
  // Medium volatility data - 5 minutes (default)
  if (key.includes('farmer') || key.includes('dealer') || key.includes('onboarding')) {
    return 5 * 60 * 1000;
  }
  
  // Low volatility data - 30 minutes
  if (key.includes('product') || key.includes('tenant') || key.includes('system')) {
    return 30 * 60 * 1000;
  }
  
  // Default
  return 5 * 60 * 1000;
};
