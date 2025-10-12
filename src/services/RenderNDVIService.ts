/**
 * Service for interacting with the NDVI Land API on Render (v3.6)
 * Base URL: https://ndvi-land-api.onrender.com
 * 
 * API v3.6 Changes:
 * - Simplified POST /requests payload (only tenant_id, land_ids)
 * - POST /run accepts only { limit } in body
 * - Added GET /queue for queue status
 * - Added GET /lands/{land_id}/ndvi for per-land data
 */

const RENDER_API_BASE_URL = 'https://ndvi-land-api.onrender.com';

export interface HealthStatus {
  status: string;
  timestamp: string;
  service?: string;
}

// API v3.6: Simplified payload for POST /requests
export interface NDVIRequestPayload {
  tenant_id: string;
  land_ids?: string[]; // Optional - API fetches all if omitted
}

// API v3.6: Response structure from POST /requests
export interface NDVIRequestResponse {
  request_id: string;
  tenant_id: string;
  tile_id: string;
  acquisition_date: string;
  status: string;
  land_count: number;
  timestamp: string;
}

// API v3.6: Response from POST /run
export interface JobRunResponse {
  status: string; // "started"
  limit: number;
  timestamp: string;
}

// API v3.6: Response from GET /stats
export interface StatsResponse {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  total_requests: number;
  timestamp: string;
}

// API v3.6: Response from GET /queue
export interface QueueStatusResponse {
  count: number;
  requests: Array<{
    id: string;
    tenant_id: string;
    tile_id: string;
    status: string;
    batch_size: number;
    land_ids: string[];
    created_at: string;
    started_at?: string;
    completed_at?: string;
    processed_count?: number;
  }>;
  timestamp: string;
}

// API v3.6: Response from GET /lands/{land_id}/ndvi
export interface LandNDVIResponse {
  land_id: string;
  count: number;
  data: Array<{
    id: string;
    tenant_id: string;
    land_id: string;
    tile_id: string;
    date: string;
    ndvi_value: number;
    ndvi_min: number;
    ndvi_max: number;
    ndvi_std: number;
    coverage: number;
    created_at: string;
    metadata: any;
  }>;
  timestamp: string;
}

export class RenderNDVIService {
  private baseUrl: string;

  constructor(baseUrl: string = RENDER_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check health status of the Render service
   * GET /health
   */
  async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  /**
   * Trigger NDVI processing worker
   * POST /run with body: { limit }
   * API v3.6: Only accepts limit parameter in body
   */
  async triggerJobs(limit: number = 10): Promise<JobRunResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit }), // ONLY limit in body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Worker trigger failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Job trigger error:', error);
      throw error;
    }
  }

  /**
   * Get queue status for a tenant
   * GET /queue?tenant_id={id}
   * API v3.6: Returns queue summary
   */
  async getQueueStatus(tenantId?: string): Promise<QueueStatusResponse> {
    try {
      const url = tenantId 
        ? `${this.baseUrl}/queue?tenant_id=${tenantId}`
        : `${this.baseUrl}/queue`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get queue failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get queue status error:', error);
      throw error;
    }
  }

  /**
   * Get NDVI data for a specific land
   * GET /lands/{land_id}/ndvi?tenant_id={id}&limit={n}
   * API v3.6: Returns historical NDVI data
   */
  async getLandNDVI(
    landId: string, 
    tenantId?: string, 
    limit: number = 30
  ): Promise<LandNDVIResponse> {
    try {
      const params = new URLSearchParams();
      if (tenantId) params.append('tenant_id', tenantId);
      params.append('limit', limit.toString());
      
      const url = `${this.baseUrl}/lands/${landId}/ndvi?${params.toString()}`;
      
      const response = await fetch(url, {
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
   * Create a new NDVI processing request
   * POST /requests
   */
  async createRequest(payload: NDVIRequestPayload): Promise<NDVIRequestResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request creation failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create request error:', error);
      throw error;
    }
  }


  /**
   * Get API statistics
   * GET /stats
   */
  async getStats(): Promise<StatsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get stats failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const renderNDVIService = new RenderNDVIService();
