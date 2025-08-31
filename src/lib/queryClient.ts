import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export const queryKeys = {
  // Farmers
  farmers: (tenantId: string) => ['farmers', tenantId] as const,
  farmersList: (tenantId: string, options?: any) => ['farmers', 'list', tenantId, options] as const,
  farmer: (farmerId: string, tenantId: string) => ['farmers', 'detail', farmerId, tenantId] as const,
  farmerStats: (tenantId: string) => ['farmers', 'stats', tenantId] as const,
  
  // Enhanced Farmer Management
  farmerEngagement: (tenantId: string, farmerId?: string) => ['farmer-engagement', tenantId, farmerId] as const,
  farmerTags: (tenantId: string, farmerId?: string) => ['farmer-tags', tenantId, farmerId] as const,
  farmerNotes: (farmerId: string, tenantId: string) => ['farmer-notes', farmerId, tenantId] as const,
  farmerSegments: (tenantId: string) => ['farmer-segments', tenantId] as const,
  communicationHistory: (farmerId: string, tenantId: string) => ['communication-history', farmerId, tenantId] as const,
  advancedFarmerSearch: (tenantId: string, params: any) => ['farmers', 'advanced-search', tenantId, params] as const,
  
  // Farmer Authentication
  farmerAuth: (tenantId: string, mobileNumber: string) => ['farmer-auth', tenantId, mobileNumber] as const,
  farmerLogin: (tenantId: string) => ['farmer-login', tenantId] as const,
  
  // Farmer Related Tables
  farmerAddresses: (farmerId: string, tenantId: string) => ['farmer-addresses', farmerId, tenantId] as const,
  farmerContacts: (farmerId: string, tenantId: string) => ['farmer-contacts', farmerId, tenantId] as const,
  
  // Lands and Crops
  farmerLands: (farmerId: string, tenantId: string) => ['farmer-lands', farmerId, tenantId] as const,
  cropHistory: (landId: string, tenantId: string) => ['crop-history', landId, tenantId] as const,
  cropHealthAssessments: (landId: string, tenantId: string) => ['crop-health', landId, tenantId] as const,
  
  // Other existing keys
  tenants: () => ['tenants'] as const,
  userTenants: (userId: string) => ['user-tenants', userId] as const,
  onboarding: (tenantId: string) => ['onboarding', tenantId] as const,
  settings: (tenantId: string) => ['settings', tenantId] as const,
  products: (tenantId: string) => ['products', tenantId] as const,
  campaigns: (tenantId: string) => ['campaigns', tenantId] as const,
  analytics: (tenantId: string) => ['analytics', tenantId] as const,
} as const;
