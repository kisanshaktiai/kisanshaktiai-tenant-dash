/**
 * Service for interacting with the NDVI Land API on Render
 * Base URL: https://ndvi-land-api.onrender.com
 * 
 * New API Endpoints:
 * - GET /health - Health check
 * - POST /ndvi/requests - Create NDVI request
 * - GET /ndvi/requests - List all requests
 * - GET /ndvi/requests/{id} - Get specific request
 * - GET /ndvi/data - Get all NDVI data
 * - GET /ndvi/data/{land_id} - Get land-specific data
 * - GET /ndvi/thumbnail/{land_id} - Get thumbnail image
 * - GET /ndvi/stats/global - Global statistics
 * - GET /ndvi/queue/status - Queue status
 * - POST /ndvi/queue/retry/{id} - Retry failed request
 */

const RENDER_API_BASE_URL = 'https://ndvi-land-api.onrender.com';

export interface HealthStatus {
  status: string;
  timestamp: string;
  service?: string;
}

// Simplified payload for POST /ndvi/lands/analyze (API v3.9)
export interface NDVIRequestPayload {
  tenant_id: string;
  land_ids: string[];
  tile_id: string; // Required by API v3.9
}

// Response structure from POST /ndvi/requests
export interface NDVIRequestResponse {
  request_id: string;
  tenant_id: string;
  land_ids: string[];
  status: string;
  created_at: string;
  message?: string;
}

// Response from GET /ndvi/requests (list)
export interface NDVIRequestListResponse {
  total: number;
  requests: Array<{
    id: string;
    tenant_id: string;
    land_ids: string[];
    status: 'queued' | 'processing' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
    completed_at?: string;
    error_message?: string;
  }>;
}

// Response from GET /ndvi/requests/{id}
export interface NDVIRequestDetailResponse {
  id: string;
  tenant_id: string;
  land_ids: string[];
  status: 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  completed_at?: string;
  processed_count: number;
  total_count: number;
  progress_percentage: number;
  error_message?: string;
}

// Response from GET /ndvi/stats/global
export interface GlobalStatsResponse {
  total_requests: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  total_lands_processed: number;
  average_ndvi: number;
  max_ndvi: number;
  min_ndvi: number;
  timestamp: string;
}

// Response from GET /ndvi/queue/status
export interface QueueStatusResponse {
  queue_length: number;
  processing_count: number;
  last_processed_at: string;
  estimated_wait_time_minutes: number;
}

// Response from GET /ndvi/data
export interface NDVIDataSummaryResponse {
  total_lands: number;
  lands_with_data: number;
  average_ndvi: number;
  data: Array<{
    land_id: string;
    land_name: string;
    latest_ndvi: number;
    latest_date: string;
    data_count: number;
  }>;
}

// Response from GET /ndvi/data/{land_id}
export interface LandNDVIResponse {
  land_id: string;
  land_name: string;
  count: number;
  average_ndvi: number;
  max_ndvi: number;
  min_ndvi: number;
  data: Array<{
    id: string;
    date: string;
    ndvi_value: number;
    ndvi_min: number;
    ndvi_max: number;
    ndvi_std: number;
    coverage: number;
    confidence: number;
    created_at: string;
  }>;
  timestamp: string;
}

export class RenderNDVIService {
  private baseUrl: string;

  constructor(baseUrl: string = RENDER_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Retry helper with exponential backoff for cold start handling
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 2000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a network error (likely cold start)
        const isColdStart = error.message?.includes('fetch') || 
                           error.message?.includes('network') ||
                           error.name === 'TypeError';
        
        if (isColdStart && attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms (service warming up)`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Check health status of the Render service
   * GET /api/v1/health
   */
  async checkHealth(): Promise<HealthStatus> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.baseUrl}/api/v1/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    });
  }

  /**
   * Ping the service to check availability
   */
  async ping(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'healthy' || health.status === 'ok' || health.status === 'running';
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a new NDVI processing request (with retry for cold starts)
   * POST /api/v1/ndvi/lands/analyze (API v3.9 correct endpoint)
   */
  async createRequest(payload: { tenant_id: string; land_ids: string[]; tile_id: string }): Promise<NDVIRequestResponse> {
    return this.retryWithBackoff(async () => {
      const params = new URLSearchParams();
      params.append('tenant_id', payload.tenant_id);

      const response = await fetch(`${this.baseUrl}/api/v1/ndvi/lands/analyze?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          land_ids: payload.land_ids,
          tile_id: payload.tile_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || `Request creation failed: ${response.status}`);
      }

      const result = await response.json();
      // API v3.9 returns { status: "success", message: "...", data: {...} }
      if (result.status === 'success') {
        return result.data || result;
      }
      return result;
    });
  }

  /**
   * Get all NDVI requests
   * GET /api/v1/ndvi/requests?tenant_id={id}&limit={n} (API v3.9)
   */
  async getRequests(
    tenantId?: string,
    status?: string,
    limit: number = 50
  ): Promise<NDVIRequestListResponse> {
    try {
      const params = new URLSearchParams();
      if (tenantId) params.append('tenant_id', tenantId);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/api/v1/ndvi/requests?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get requests failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      // API v3.9 returns { status: "success", requests: [...] }
      if (result.status === 'success') {
        return {
          total: result.requests?.length || 0,
          requests: result.requests || [],
        };
      }
      return result;
    } catch (error) {
      console.error('Get requests error:', error);
      throw error;
    }
  }

  /**
   * Get specific NDVI request status
   * GET /api/v1/ndvi/requests/{request_id}
   */
  async getRequestStatus(requestId: string): Promise<NDVIRequestDetailResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ndvi/requests/${requestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get request status failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get request status error:', error);
      throw error;
    }
  }

  /**
   * Get NDVI data summary for all lands
   * GET /api/v1/ndvi/data?tenant_id={id}&limit={n} (API v3.9)
   */
  async getNDVIData(tenantId?: string, limit: number = 100): Promise<NDVIDataSummaryResponse> {
    try {
      const params = new URLSearchParams();
      if (tenantId) params.append('tenant_id', tenantId);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/api/v1/ndvi/data?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get NDVI data failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      // API v3.9 returns { status: "success", count: N, data: [...] }
      if (result.status === 'success') {
        return {
          total_lands: result.count || 0,
          lands_with_data: result.count || 0,
          average_ndvi: 0, // Will be calculated from data
          data: result.data || [],
        };
      }
      return result;
    } catch (error) {
      console.error('Get NDVI data error:', error);
      throw error;
    }
  }

  /**
   * Get NDVI data for a specific land
   * GET /api/v1/ndvi/data/{land_id}?limit={n}
   */
  async getLandNDVI(
    landId: string,
    limit: number = 30
  ): Promise<LandNDVIResponse> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/api/v1/ndvi/data/${landId}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get land NDVI failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get land NDVI error:', error);
      throw error;
    }
  }

  /**
   * Get NDVI thumbnail image for a land
   * GET /api/v1/ndvi/thumbnail/{land_id}
   */
  async getLandThumbnail(landId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ndvi/thumbnail/${landId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Get thumbnail failed: ${response.status} ${response.statusText}`);
      }

      // Return the image URL
      return `${this.baseUrl}/api/v1/ndvi/thumbnail/${landId}`;
    } catch (error) {
      console.error('Get thumbnail error:', error);
      throw error;
    }
  }

  /**
   * Get global NDVI statistics
   * GET /api/v1/ndvi/requests/stats (API v3.9 correct endpoint)
   */
  async getGlobalStats(): Promise<GlobalStatsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ndvi/requests/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get global stats failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      // API v3.9 returns { status: "success", stats: {...} }
      if (result.status === 'success' && result.stats) {
        return {
          total_requests: result.stats.total_requests || 0,
          queued: result.stats.queued || 0,
          processing: result.stats.processing || 0,
          completed: result.stats.completed || 0,
          failed: result.stats.failed || 0,
          total_lands_processed: 0,
          average_ndvi: 0,
          max_ndvi: 0,
          min_ndvi: 0,
          timestamp: result.timestamp || new Date().toISOString(),
        };
      }
      return result;
    } catch (error) {
      console.error('Get global stats error:', error);
      throw error;
    }
  }

  /**
   * Get queue status
   * GET /api/v1/ndvi/requests/queue (API v3.9 correct endpoint)
   */
  async getQueueStatus(tenantId: string): Promise<QueueStatusResponse> {
    try {
      const params = new URLSearchParams();
      params.append('tenant_id', tenantId);

      const response = await fetch(`${this.baseUrl}/api/v1/ndvi/requests/queue?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get queue status failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      // API v3.9 returns { status: "success", count: N, queue: [...] }
      if (result.status === 'success') {
        return {
          queue_length: result.count || 0,
          processing_count: result.queue?.filter((q: any) => q.status === 'processing').length || 0,
          last_processed_at: new Date().toISOString(),
          estimated_wait_time_minutes: Math.ceil((result.count || 0) * 2), // rough estimate
        };
      }
      return result;
    } catch (error) {
      console.error('Get queue status error:', error);
      throw error;
    }
  }

  /**
   * Retry a failed NDVI request
   * POST /api/v1/ndvi/queue/retry/{request_id}
   */
  async retryRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ndvi/queue/retry/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Retry request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Retry request error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const renderNDVIService = new RenderNDVIService();
