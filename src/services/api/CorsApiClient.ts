import { supabase } from '@/integrations/supabase/client';
import { CORS_CONFIG } from './cors';

export interface ApiRequestOptions extends RequestInit {
  tenantId?: string;
  requireAuth?: boolean;
  retryCount?: number;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  headers?: Headers;
}

/**
 * Centralized API client with CORS, authentication, and tenant isolation
 */
export class CorsApiClient {
  private baseUrl: string;
  private defaultTimeout = 30000; // 30 seconds
  private maxRetries = 3;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || `${import.meta.env.VITE_SUPABASE_URL || 'https://qfklkkzxemsbeniyugiz.supabase.co'}/functions/v1`;
  }

  /**
   * Make an API request with automatic CORS, auth, and tenant handling
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      tenantId,
      requireAuth = true,
      retryCount = 0,
      timeout = this.defaultTimeout,
      ...fetchOptions
    } = options;

    try {
      // Build headers
      const headers = new Headers({
        ...CORS_CONFIG.headers,
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as any || {}),
      });

      // Add authentication if required
      if (requireAuth) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          return {
            error: 'Authentication required',
            status: 401,
          };
        }
        headers.set('Authorization', `Bearer ${session.access_token}`);
      }

      // Add tenant ID if provided
      if (tenantId) {
        headers.set('X-Tenant-ID', tenantId);
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Make the request
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      let data: T | undefined;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        try {
          data = await response.json();
        } catch (e) {
          console.error('Failed to parse JSON response:', e);
        }
      }

      // Handle errors
      if (!response.ok) {
        // Retry on certain status codes
        if (retryCount < this.maxRetries && this.shouldRetry(response.status)) {
          console.log(`Retrying request to ${endpoint} (attempt ${retryCount + 1}/${this.maxRetries})`);
          await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
          return this.request(endpoint, { ...options, retryCount: retryCount + 1 });
        }

        return {
          error: (data as any)?.error || `Request failed with status ${response.status}`,
          status: response.status,
          headers: response.headers,
          data,
        };
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
      };

    } catch (error) {
      // Handle network errors
      if (error.name === 'AbortError') {
        return {
          error: 'Request timeout',
          status: 408,
        };
      }

      // Retry on network errors
      if (retryCount < this.maxRetries) {
        console.log(`Retrying request to ${endpoint} due to network error (attempt ${retryCount + 1}/${this.maxRetries})`);
        await this.delay(Math.pow(2, retryCount) * 1000);
        return this.request(endpoint, { ...options, retryCount: retryCount + 1 });
      }

      return {
        error: error.message || 'Network error',
        status: 0,
      };
    }
  }

  /**
   * GET request helper
   */
  async get<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request helper
   */
  async post<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request helper
   */
  async put<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request helper
   */
  async patch<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request helper
   */
  async delete<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Check if a status code should trigger a retry
   */
  private shouldRetry(status: number): boolean {
    return status === 429 || // Rate limited
           status === 502 || // Bad gateway
           status === 503 || // Service unavailable
           status === 504;   // Gateway timeout
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const apiClient = new CorsApiClient();