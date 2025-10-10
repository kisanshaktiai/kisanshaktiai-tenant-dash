/**
 * Service for interacting with the NDVI Land API on Render
 * Base URL: https://ndvi-land-api.onrender.com
 */

const RENDER_API_BASE_URL = 'https://ndvi-land-api.onrender.com';

export interface HealthStatus {
  status: string;
  timestamp: string;
  version?: string;
  uptime?: number;
}

export interface JobRunResponse {
  success: boolean;
  jobs_triggered: number;
  message: string;
  job_ids?: string[];
}

export interface JobRunParams {
  limit?: number;
  use_queue?: boolean;
  tenant_id?: string;
  tile_ids?: string[];
}

export interface NDVIRequestPayload {
  land_ids?: string[];
  farmer_id?: string;
  priority?: number;
  requested_date?: string;
}

export interface NDVIRequestResponse {
  request_id: string;
  status: string;
  created_at: string;
  lands_count: number;
}

export interface RequestStatus {
  request_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_lands: number;
  processed_lands: number;
  failed_lands: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface StatsResponse {
  total_requests: number;
  completed_requests: number;
  failed_requests: number;
  pending_requests: number;
  total_lands_processed: number;
  avg_processing_time_seconds: number;
  success_rate: number;
  last_24h_requests: number;
  storage_usage_mb: number;
  api_health: string;
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
   * Trigger NDVI processing jobs
   * POST /run?limit=10&use_queue=true
   */
  async triggerJobs(params: JobRunParams = {}): Promise<JobRunResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }
      
      if (params.use_queue !== undefined) {
        queryParams.append('use_queue', params.use_queue.toString());
      }

      const url = `${this.baseUrl}/run${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: params.tenant_id,
          tile_ids: params.tile_ids,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Job trigger failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Job trigger error:', error);
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
   * Get status of a specific request
   * GET /requests/{request_id}
   */
  async getRequestStatus(requestId: string): Promise<RequestStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/requests/${requestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Get status failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get request status error:', error);
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
