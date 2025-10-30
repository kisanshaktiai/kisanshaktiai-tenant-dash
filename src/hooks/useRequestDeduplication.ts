
import { useRef, useCallback } from 'react';

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

export const useRequestDeduplication = () => {
  const pendingRequestsRef = useRef<Map<string, PendingRequest>>(new Map());
  const REQUEST_TIMEOUT = 5000; // 5 seconds

  const deduplicateRequest = useCallback(async <T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    const now = Date.now();
    const existing = pendingRequestsRef.current.get(key);

    // Check if there's a pending request that hasn't timed out
    if (existing && (now - existing.timestamp) < REQUEST_TIMEOUT) {
      console.log('Deduplicating request for key:', key);
      return existing.promise;
    }

    // Create new request
    const promise = requestFn().finally(() => {
      // Clean up after request completes
      pendingRequestsRef.current.delete(key);
    });

    // Store the pending request
    pendingRequestsRef.current.set(key, {
      promise,
      timestamp: now
    });

    return promise;
  }, []);

  const clearPendingRequests = useCallback(() => {
    pendingRequestsRef.current.clear();
  }, []);

  // Clean up expired requests periodically
  const cleanupExpiredRequests = useCallback(() => {
    const now = Date.now();
    for (const [key, request] of pendingRequestsRef.current.entries()) {
      if (now - request.timestamp > REQUEST_TIMEOUT) {
        pendingRequestsRef.current.delete(key);
      }
    }
  }, []);

  return {
    deduplicateRequest,
    clearPendingRequests,
    cleanupExpiredRequests
  };
};
