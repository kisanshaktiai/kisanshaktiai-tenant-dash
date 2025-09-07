import { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { apiClient } from '@/services/api/CorsApiClient';
import type { ApiRequestOptions, ApiResponse } from '@/services/api/CorsApiClient';

/**
 * Hook for making tenant-scoped API calls with automatic tenant injection
 */
export const useTenantApi = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);

  /**
   * Make a GET request with tenant context
   */
  const get = useCallback(async <T = any>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, 'tenantId'>
  ): Promise<ApiResponse<T>> => {
    if (!currentTenant?.id) {
      return {
        error: 'No tenant selected',
        status: 400,
      };
    }

    return apiClient.get<T>(endpoint, {
      ...options,
      tenantId: currentTenant.id,
      requireAuth: true,
    });
  }, [currentTenant]);

  /**
   * Make a POST request with tenant context
   */
  const post = useCallback(async <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'tenantId'>
  ): Promise<ApiResponse<T>> => {
    if (!currentTenant?.id) {
      return {
        error: 'No tenant selected',
        status: 400,
      };
    }

    return apiClient.post<T>(endpoint, body, {
      ...options,
      tenantId: currentTenant.id,
      requireAuth: true,
    });
  }, [currentTenant]);

  /**
   * Make a PUT request with tenant context
   */
  const put = useCallback(async <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'tenantId'>
  ): Promise<ApiResponse<T>> => {
    if (!currentTenant?.id) {
      return {
        error: 'No tenant selected',
        status: 400,
      };
    }

    return apiClient.put<T>(endpoint, body, {
      ...options,
      tenantId: currentTenant.id,
      requireAuth: true,
    });
  }, [currentTenant]);

  /**
   * Make a PATCH request with tenant context
   */
  const patch = useCallback(async <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'tenantId'>
  ): Promise<ApiResponse<T>> => {
    if (!currentTenant?.id) {
      return {
        error: 'No tenant selected',
        status: 400,
      };
    }

    return apiClient.patch<T>(endpoint, body, {
      ...options,
      tenantId: currentTenant.id,
      requireAuth: true,
    });
  }, [currentTenant]);

  /**
   * Make a DELETE request with tenant context
   */
  const del = useCallback(async <T = any>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, 'tenantId'>
  ): Promise<ApiResponse<T>> => {
    if (!currentTenant?.id) {
      return {
        error: 'No tenant selected',
        status: 400,
      };
    }

    return apiClient.delete<T>(endpoint, {
      ...options,
      tenantId: currentTenant.id,
      requireAuth: true,
    });
  }, [currentTenant]);

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    currentTenant,
    user,
    isReady: !!currentTenant && !!user,
  };
};