
import { QueryClient, DefaultOptions } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors except 408, 429
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
          return false;
        }
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  },
  mutations: {
    retry: 1,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query key factory for consistent cache management
export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  
  // Tenants
  tenants: ['tenants'] as const,
  tenant: (id: string) => ['tenants', id] as const,
  
  // Farmers
  farmers: ['farmers'] as const,
  farmersList: (tenantId: string, filters?: Record<string, any>) => 
    ['farmers', 'list', tenantId, filters] as const,
  farmer: (id: string) => ['farmers', id] as const,
  farmerStats: (tenantId: string) => ['farmers', 'stats', tenantId] as const,
  
  // Dealers
  dealers: ['dealers'] as const,
  dealersList: (tenantId: string) => ['dealers', 'list', tenantId] as const,
  dealer: (id: string) => ['dealers', id] as const,
  
  // Products
  products: ['products'] as const,
  productsList: (tenantId: string) => ['products', 'list', tenantId] as const,
  product: (id: string) => ['products', id] as const,
  
  // Analytics
  analytics: ['analytics'] as const,
  dashboardStats: (tenantId: string) => ['analytics', 'dashboard', tenantId] as const,
  engagementStats: (tenantId: string) => ['analytics', 'engagement', tenantId] as const,
} as const;
