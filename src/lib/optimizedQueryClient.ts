
import { QueryClient } from '@tanstack/react-query';

// Tiered caching strategy based on data types
const getQueryDefaults = (queryKey: readonly unknown[]) => {
  const keyString = JSON.stringify(queryKey);
  
  // Real-time data (frequently changing)
  if (keyString.includes('dashboard') || keyString.includes('analytics')) {
    return {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 2 * 60 * 1000, // 2 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    };
  }
  
  // User data (moderately changing)
  if (keyString.includes('farmers') || keyString.includes('dealers')) {
    return {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    };
  }
  
  // Configuration data (rarely changing)
  if (keyString.includes('tenants') || keyString.includes('subscription')) {
    return {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    };
  }
  
  // Default for other queries
  return {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  };
};

export const optimizedQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      // Dynamic defaults based on query key
      ...getQueryDefaults,
    },
    mutations: {
      retry: 1,
    },
  },
});
