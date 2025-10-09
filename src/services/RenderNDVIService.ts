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
      return health.status === 'healthy' || health.status === 'ok';
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const renderNDVIService = new RenderNDVIService();
