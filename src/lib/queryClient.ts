import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  // Auth
  user: () => ['user'] as const,

  // Tenant
  tenants: () => ['tenants'] as const,
  userTenants: (userId: string) => ['tenants', userId] as const,
  currentTenant: () => ['tenants', 'current'] as const,
  subscriptionPlans: () => ['subscription-plans'] as const,

  // Farmers
  farmers: (tenantId: string) => ['farmers', tenantId] as const,
  farmer: (farmerId: string, tenantId: string) => ['farmers', tenantId, farmerId] as const,
  farmerStats: (tenantId: string) => ['farmers', tenantId, 'stats'] as const,

  // Products
  products: (tenantId: string) => ['products', tenantId] as const,
  product: (productId: string, tenantId: string) => ['products', tenantId, productId] as const,

  // Analytics
  analytics: (tenantId: string) => ['analytics', tenantId] as const,
  dashboardStats: (tenantId: string) => ['analytics', tenantId, 'dashboard-stats'] as const,
  engagementStats: (tenantId: string) => ['analytics', tenantId, 'engagement-stats'] as const,

  // Dealers
  dealers: (tenantId: string) => ['dealers', tenantId] as const,
  dealersList: (tenantId: string) => ['dealers', tenantId, 'list'] as const,
  dealer: (dealerId: string, tenantId: string) => ['dealers', tenantId, 'detail', dealerId] as const,
  
  // Territories
  territories: (tenantId: string, options?: any) => ['territories', tenantId, options] as const,
  
  // Dealer Performance
  dealerPerformance: (tenantId: string, options?: any) => ['dealer-performance', tenantId, options] as const,
  
  // Dealer Communications
  dealerCommunications: (tenantId: string, options?: any) => ['dealer-communications', tenantId, options] as const,
  
  // Dealer Incentives
  dealerIncentives: (tenantId: string, options?: any) => ['dealer-incentives', tenantId, options] as const,
  
  // Dealer Onboarding
  dealerOnboarding: (dealerId: string, tenantId: string) => ['dealer-onboarding', tenantId, dealerId] as const,
} as const;
