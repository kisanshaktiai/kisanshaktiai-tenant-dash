
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

// Query key factory for consistent cache management with tenant isolation
export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  
  // Tenants - FIXED: Always include tenant context
  tenants: ['tenants'] as const,
  tenant: (id: string) => ['tenants', id] as const,
  
  // Farmers - FIXED: Always include tenantId in cache keys
  farmers: (tenantId: string) => ['farmers', tenantId] as const,
  farmersList: (tenantId: string, filters?: Record<string, any>) => 
    ['farmers', 'list', tenantId, filters] as const,
  farmer: (id: string, tenantId: string) => ['farmers', id, tenantId] as const,
  farmerStats: (tenantId: string) => ['farmers', 'stats', tenantId] as const,
  
  // Dealers - FIXED: Always include tenantId in cache keys
  dealers: (tenantId: string) => ['dealers', tenantId] as const,
  dealersList: (tenantId: string) => ['dealers', 'list', tenantId] as const,
  dealer: (id: string, tenantId: string) => ['dealers', id, tenantId] as const,
  
  // Products - FIXED: Always include tenantId in cache keys
  products: (tenantId: string) => ['products', tenantId] as const,
  productsList: (tenantId: string) => ['products', 'list', tenantId] as const,
  product: (id: string, tenantId: string) => ['products', id, tenantId] as const,
  
  // Analytics - FIXED: Always include tenantId in cache keys
  analytics: (tenantId: string) => ['analytics', tenantId] as const,
  dashboardStats: (tenantId: string) => ['analytics', 'dashboard', tenantId] as const,
  engagementStats: (tenantId: string) => ['analytics', 'engagement', tenantId] as const,
} as const;
