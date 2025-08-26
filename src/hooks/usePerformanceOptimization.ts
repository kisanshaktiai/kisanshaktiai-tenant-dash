
import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceMetrics {
  pageLoadTime: number;
  queryResponseTime: Record<string, number>;
  memoryUsage: number;
  cacheHitRate: number;
}

export const usePerformanceOptimization = () => {
  const queryClient = useQueryClient();
  const metricsRef = useRef<PerformanceMetrics>({
    pageLoadTime: 0,
    queryResponseTime: {},
    memoryUsage: 0,
    cacheHitRate: 0
  });

  // Measure page load time
  useEffect(() => {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metricsRef.current.pageLoadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
    }
  }, []);

  // Smart cache management
  const optimizeCache = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Remove stale queries older than 10 minutes
    queries.forEach(query => {
      const lastUpdated = query.state.dataUpdatedAt;
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      
      if (lastUpdated < tenMinutesAgo && !query.getObserversCount()) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });

    // Prefetch critical data
    queryClient.prefetchQuery({
      queryKey: ['dashboard-stats'],
      queryFn: () => Promise.resolve({}),
      staleTime: 5 * 60 * 1000
    });
  }, [queryClient]);

  // Memory monitoring
  const monitorMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      metricsRef.current.memoryUsage = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
      
      // If memory usage is high, trigger garbage collection optimizations
      if (metricsRef.current.memoryUsage > 0.8) {
        optimizeCache();
      }
    }
  }, [optimizeCache]);

  // Performance monitoring interval
  useEffect(() => {
    const interval = setInterval(() => {
      monitorMemoryUsage();
      optimizeCache();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [monitorMemoryUsage, optimizeCache]);

  // Lazy loading optimization
  const createIntersectionObserver = useCallback((callback: IntersectionObserverCallback) => {
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1
    });
  }, []);

  // Debounced search optimization
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  return {
    metrics: metricsRef.current,
    optimizeCache,
    createIntersectionObserver,
    debounce,
    monitorMemoryUsage
  };
};
