import { QueryClient } from '@tanstack/react-query';

// Optimized query configuration for organization management
export const organizationQueryConfig = {
  // Profile data - medium volatility
  profile: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  },
  
  // Branding - low volatility
  branding: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  },
  
  // Features - low volatility
  features: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  },
  
  // Settings - medium volatility
  settings: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  },
  
  // Analytics - high volatility
  analytics: {
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  },
  
  // AI Insights - medium volatility
  insights: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  },
  
  // Audit logs - append-only, can cache longer
  auditLogs: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  },
};

// Prefetch critical organization data
export const prefetchOrganizationData = async (
  queryClient: QueryClient,
  tenantId: string
) => {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['organization-profile', tenantId],
      ...organizationQueryConfig.profile,
    }),
    queryClient.prefetchQuery({
      queryKey: ['organization-branding', tenantId],
      ...organizationQueryConfig.branding,
    }),
    queryClient.prefetchQuery({
      queryKey: ['organization-features', tenantId],
      ...organizationQueryConfig.features,
    }),
  ]);
};
