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
   * Get NDVI data summary (v4.1.0 - unified ndvi_micro_tiles table)
   * GET /api/v1/ndvi/data?tenant_id={id}&land_id={id}&limit={n}
   */
  async getNDVIData(tenantId: string, landId?: string, limit: number = 1000): Promise<NDVIDataSummaryResponse> {
    return this.retryWithBackoff(async () => {
      if (!tenantId) {
        throw new Error('tenant_id is required for getNDVIData');
      }

      const params = new URLSearchParams();
      params.append('tenant_id', tenantId);
      if (landId) params.append('land_id', landId);
      params.append('limit', limit.toString());

      const url = `${this.baseUrl}/api/v1/ndvi/data?${params.toString()}`;
      console.log(`📡 RenderNDVIService.getNDVIData: GET ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Get NDVI data failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ RenderNDVIService.getNDVIData: Received ${result.data?.length || 0} records`);
      
      // v4.1.0 returns { status: "success", count: N, data: [...] }
      if (result.status === 'success') {
        return {
          total_lands: result.count || 0,
          lands_with_data: result.count || 0,
          average_ndvi: 0,
          data: result.data || [],
        };
      }
      return result;
    });
  }

  /**
   * Get latest NDVI for a specific land (v4.1.0)
   * GET /api/v1/ndvi/data/{land_id}/latest?tenant_id={id}
   */
  async getLatestNDVI(landId: string, tenantId: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      params.append('tenant_id', tenantId);

      const response = await fetch(`${this.baseUrl}/api/v1/ndvi/data/${landId}/latest?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get latest NDVI failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get latest NDVI error:', error);
      throw error;
    }
  }

  /**
   * Get NDVI history for a specific land (v4.1.0)
   * GET /api/v1/ndvi/data/{land_id}/history?tenant_id={id}&limit={n}
   */
  async getNDVIHistory(landId: string, tenantId: string, limit: number = 30): Promise<any> {
    try {
      const params = new URLSearchParams();
      params.append('tenant_id', tenantId);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/api/v1/ndvi/data/${landId}/history?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get NDVI history failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get NDVI history error:', error);
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
   * Get statistics (v4.1.0 - ALWAYS requires tenant_id)
   * GET /api/v1/ndvi/requests/stats?tenant_id={id}
   */
  async getStats(tenantId: string): Promise<GlobalStatsResponse> {
    return this.retryWithBackoff(async () => {
      if (!tenantId) {
        throw new Error('tenant_id is required for getStats');
      }

      const params = new URLSearchParams();
      params.append('tenant_id', tenantId);

      const url = `${this.baseUrl}/api/v1/ndvi/requests/stats?${params.toString()}`;
      console.log(`📡 RenderNDVIService.getStats: GET ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Get stats failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ RenderNDVIService.getStats: Received stats`, result);
      
      // v4.1.0 returns { status: "success", tenant_id: "...", stats: {...} }
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
          timestamp: new Date().toISOString(),
        };
      }
      return result;
    });
  }

  /**
   * Get diagnostic info for a specific land (v4.1.0)
   * GET /api/v1/ndvi/diagnostics/land/{land_id}?tenant_id={id}
   */
  async getLandDiagnostics(landId: string, tenantId: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      params.append('tenant_id', tenantId);

      const response = await fetch(`${this.baseUrl}/api/v1/ndvi/diagnostics/land/${landId}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get diagnostics failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get diagnostics error:', error);
      throw error;
    }
  }

  /**
   * Create NDVI analysis request (v3.9 - matches Python API)
   * POST /api/v1/ndvi/lands/analyze?tenant_id={id}
   * Body: { land_ids: string[], tile_id: string }
   */
  async createAnalysisRequest(tenantId: string, landIds: string[], tileId: string): Promise<any> {
    return this.retryWithBackoff(async () => {
      if (!tenantId || !landIds?.length || !tileId) {
        throw new Error('tenant_id, land_ids, and tile_id are required');
      }

      const url = `${this.baseUrl}/api/v1/ndvi/lands/analyze?tenant_id=${tenantId}`;
      console.log(`📡 RenderNDVIService.createAnalysisRequest: POST ${url}`, { landIds, tileId });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          land_ids: landIds,
          tile_id: tileId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Create analysis request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ RenderNDVIService.createAnalysisRequest: Request created`, result);
      return result;
    });
  }

  /**
   * Get NDVI request queue (v3.9)
   * GET /api/v1/ndvi/requests/queue?tenant_id={id}
   */
  async getRequestQueue(tenantId: string): Promise<any> {
    try {
      if (!tenantId) {
        throw new Error('tenant_id is required');
      }

      const params = new URLSearchParams();
      params.append('tenant_id', tenantId);

      const url = `${this.baseUrl}/api/v1/ndvi/requests/queue?${params.toString()}`;
      console.log(`📡 RenderNDVIService.getRequestQueue: GET ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get request queue failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ RenderNDVIService.getRequestQueue: Received ${result.queue?.length || 0} requests`);
      return result;
    } catch (error) {
      console.error('Get request queue error:', error);
      throw error;
    }
  }

  /**
   * Get queue status (v3.9)
   * GET /api/v1/ndvi/queue/status
   */
  async getQueueStatus(): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/v1/ndvi/queue/status`;
      console.log(`📡 RenderNDVIService.getQueueStatus: GET ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get queue status failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ RenderNDVIService.getQueueStatus:`, result);
      return result;
    } catch (error) {
      console.error('Get queue status error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const renderNDVIService = new RenderNDVIService();
