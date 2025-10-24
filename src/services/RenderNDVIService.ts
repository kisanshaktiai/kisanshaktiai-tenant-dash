/**
 * NDVI Land API Service (v4.0)
 * 
 * Enterprise-grade SDK for the Render-hosted NDVI processing API.
 * Provides robust multi-tenant operations with timeout handling, 
 * structured errors, exponential retry, and cold-start resilience.
 * 
 * © KisanShaktiAI | 2025
 */

// Base URL for the Render API (v4.0)
const RENDER_API_BASE_URL = 'https://ndvi-land-api.onrender.com/api/v1';

export interface HealthStatus {
  status: string;
  timestamp: string;
  service?: string;
  version?: string;
}

export interface NDVIRequestPayload {
  tenant_id: string;
  land_ids: string[];
  tile_id: string;
}

export interface NDVIRequestResponse {
  status: string;
  message?: string;
  data?: any;
  request_id?: string;
  tenant_id?: string;
  land_ids?: string[];
  created_at?: string;
}

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

export interface GlobalStatsResponse {
  status?: string;
  stats?: {
    total_requests?: number;
    queued?: number;
    processing?: number;
    completed?: number;
    failed?: number;
  };
  total_requests?: number;
  queued?: number;
  processing?: number;
  completed?: number;
  failed?: number;
  total_lands_processed?: number;
  average_ndvi?: number;
  max_ndvi?: number;
  min_ndvi?: number;
  timestamp?: string;
}

export interface QueueStatusResponse {
  status?: string;
  active_jobs?: number;
  queue_length?: number;
  processing_count?: number;
  last_processed_at?: string;
  estimated_wait_time_minutes?: number;
  timestamp?: string;
}

export interface NDVIDataSummaryResponse {
  status?: string;
  count?: number;
  total_lands?: number;
  lands_with_data?: number;
  average_ndvi?: number;
  data?: Array<{
    land_id: string;
    tenant_id?: string;
    tile_id?: string;
    acquisition_date?: string;
    date?: string;
    ndvi_mean?: number;
    ndvi_value?: number;
    ndvi_min?: number;
    ndvi_max?: number;
    ndvi_std?: number;
    coverage?: number;
    image_url?: string;
    created_at?: string;
    land_name?: string;
    latest_ndvi?: number;
    latest_date?: string;
    data_count?: number;
  }>;
}

export interface LandNDVIResponse {
  land_id: string;
  land_name?: string;
  count?: number;
  average_ndvi?: number;
  max_ndvi?: number;
  min_ndvi?: number;
  data?: Array<{
    id: string;
    date: string;
    ndvi_value: number;
    ndvi_min: number;
    ndvi_max: number;
    ndvi_std: number;
    coverage: number;
    confidence?: number;
    image_url?: string;
    created_at: string;
  }>;
  timestamp?: string;
}

/**
 * RenderNDVIService (v4.0)
 * 
 * Enterprise-grade service class for NDVI Land API interactions.
 * Features: timeout handling, structured errors, exponential retry, 
 * tenant validation, and cold-start resilience.
 */
export class RenderNDVIService {
  private baseUrl: string;
  private version = 'v4.0';
  private defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-NDVI-Client': 'KisanShaktiAI-Dashboard',
  };
  private defaultTimeout = 30000; // 30 seconds

  constructor(baseUrl: string = RENDER_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch with timeout using AbortController
   * @param url - Request URL
   * @param options - Fetch options
   * @param timeout - Timeout in milliseconds (default: 30s)
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = this.defaultTimeout
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.handleError(0, url, 'Request timeout', { timeout, error });
      }
      throw error;
    }
  }

  /**
   * Unified structured error handler
   * @param status - HTTP status code
   * @param url - Request URL
   * @param message - Error message
   * @param details - Additional error details
   */
  private handleError(status: number, url: string, message: string, details?: any): Error {
    const error = new Error(message) as any;
    error.status = status;
    error.url = url;
    error.details = details;
    console.error(`❌ [NDVI-${this.version}] Error ${status}: ${message}`, { url, details });
    return error;
  }

  /**
   * Safely extract data from API response
   * @param result - API response object
   * @param defaultValue - Default value if extraction fails
   */
  private unwrap<T>(result: any, defaultValue: T): T {
    if (result && result.status === 'success' && result.data !== undefined) {
      return result.data as T;
    }
    return defaultValue;
  }

  /**
   * Validate tenant_id parameter
   * @param tenantId - Tenant identifier
   */
  private validateTenantId(tenantId: string | undefined): void {
    if (!tenantId || tenantId.trim() === '') {
      throw this.handleError(400, this.baseUrl, 'tenant_id is required', { tenantId });
    }
  }

  /**
   * Retry a function with exponential backoff
   * Useful for handling cold starts on the Render service
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 2000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`🔄 [NDVI-${this.version}] Attempt ${i + 1}/${maxRetries}...`);
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        const delay = baseDelay * Math.pow(2, i);
        console.log(`⏳ [NDVI-${this.version}] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Warm up the NDVI API service (check if it's responsive)
   */
  async warm(): Promise<void> {
    try {
      const health = await this.checkHealth();
      if (health.status === 'healthy') {
        console.log(`🔥 [NDVI-${this.version}] API warmed up successfully`);
      }
    } catch (error) {
      console.warn(`⚠️ [NDVI-${this.version}] API cold, will retry lazily on next request`);
    }
  }

  /**
   * Check the health status of the NDVI API
   */
  async checkHealth(): Promise<HealthStatus> {
    console.log(`🏥 [NDVI-${this.version}] Checking API health...`);
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw this.handleError(
          response.status,
          `${this.baseUrl}/health`,
          `Health check failed: ${response.statusText}`,
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log(`✅ [NDVI-${this.version}] API is healthy:`, data);
      return data;
    } catch (error) {
      console.error(`❌ [NDVI-${this.version}] Health check failed:`, error);
      throw error;
    }
  }

  /**
   * Quick ping to check if service is available
   */
  async ping(): Promise<boolean> {
    try {
      console.log(`🏓 [NDVI-${this.version}] Pinging API...`);
      const health = await this.checkHealth();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }

  /**
   * Get NDVI data with retry logic for cold starts
   */
  async getNDVIData(
    tenantId: string,
    landId?: string,
    limit: number = 100
  ): Promise<NDVIDataSummaryResponse> {
    this.validateTenantId(tenantId);

    console.log(`📡 [NDVI-${this.version}] Fetching NDVI data for tenant: ${tenantId}${landId ? `, land: ${landId}` : ''}`);

    return this.retryWithBackoff(async () => {
      const params = new URLSearchParams({
        tenant_id: tenantId,
        limit: limit.toString(),
      });
      
      if (landId) {
        params.append('land_id', landId);
      }

      const url = `${this.baseUrl}/ndvi/data?${params}`;
      console.log(`🌐 [NDVI-${this.version}] GET ${url}`);
      
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw this.handleError(
          response.status,
          url,
          `Failed to fetch NDVI data: ${errorText}`,
          { tenantId, landId, limit }
        );
      }

      const result = await response.json();
      console.log(`✅ [NDVI-${this.version}] Fetched ${result.count || 0} NDVI records`);
      return result;
    });
  }

  /**
   * Get the latest NDVI data for a specific land
   */
  async getLatestNDVI(landId: string, tenantId: string): Promise<any> {
    this.validateTenantId(tenantId);
    console.log(`📍 [NDVI-${this.version}] Fetching latest NDVI for land: ${landId}`);
    const response = await this.getNDVIData(tenantId, landId, 1);
    return this.unwrap(response, [])[0] || null;
  }

  /**
   * Get NDVI history for a specific land
   */
  async getNDVIHistory(landId: string, tenantId: string, limit: number = 30): Promise<any[]> {
    this.validateTenantId(tenantId);
    console.log(`📜 [NDVI-${this.version}] Fetching NDVI history for land: ${landId} (limit: ${limit})`);
    const response = await this.getNDVIData(tenantId, landId, limit);
    return this.unwrap(response, []);
  }

  /**
   * Get detailed NDVI data for a specific land
   */
  async getLandNDVI(landId: string, limit: number = 10): Promise<LandNDVIResponse> {
    console.log(`🗺️ [NDVI-${this.version}] Fetching detailed NDVI for land: ${landId}`);
    try {
      const url = `${this.baseUrl}/ndvi/land/${landId}?limit=${limit}`;
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw this.handleError(
          response.status,
          url,
          `Failed to fetch land NDVI`,
          { landId, limit }
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ [NDVI-${this.version}] Error fetching land NDVI:`, error);
      throw error;
    }
  }

  /**
   * Get NDVI thumbnail URL for a land
   */
  async getLandThumbnail(landId: string): Promise<string | null> {
    console.log(`🖼️ [NDVI-${this.version}] Fetching thumbnail for land: ${landId}`);
    try {
      const response = await this.getLandNDVI(landId, 1);
      const data = this.unwrap(response, []);
      return data[0]?.image_url || null;
    } catch {
      return null;
    }
  }

  /**
   * Get global NDVI statistics for a tenant
   */
  async getStats(tenantId: string): Promise<GlobalStatsResponse> {
    this.validateTenantId(tenantId);

    console.log(`📊 [NDVI-${this.version}] Fetching global NDVI stats for tenant: ${tenantId}`);

    return this.retryWithBackoff(async () => {
      const url = `${this.baseUrl}/ndvi/stats/global?tenant_id=${tenantId}`;
      console.log(`🌐 [NDVI-${this.version}] GET ${url}`);
      
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw this.handleError(
          response.status,
          url,
          `Failed to fetch stats: ${errorText}`,
          { tenantId }
        );
      }

      const result = await response.json();
      console.log(`✅ [NDVI-${this.version}] Fetched global stats successfully`);
      return result;
    });
  }

  /**
   * Get diagnostics for a specific land
   */
  async getLandDiagnostics(landId: string, tenantId: string): Promise<any> {
    this.validateTenantId(tenantId);
    console.log(`🔬 [NDVI-${this.version}] Fetching diagnostics for land: ${landId}`);
    try {
      const url = `${this.baseUrl}/ndvi/diagnostics/${landId}?tenant_id=${tenantId}`;
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw this.handleError(
          response.status,
          url,
          `Failed to fetch diagnostics`,
          { landId, tenantId }
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ [NDVI-${this.version}] Error fetching land diagnostics:`, error);
      throw error;
    }
  }

  /**
   * Create a new NDVI analysis request
   */
  async createAnalysisRequest(
    tenantId: string,
    landIds: string[],
    tileId: string,
    metadata?: Record<string, any>
  ): Promise<NDVIRequestResponse> {
    this.validateTenantId(tenantId);
    console.log(`🚀 [NDVI-${this.version}] Creating NDVI analysis request for ${landIds.length} lands (tile: ${tileId})`);
    try {
      const url = `${this.baseUrl}/ndvi/lands/analyze?tenant_id=${tenantId}`;
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          land_ids: landIds,
          tile_id: tileId,
          statistics_only: false,
          priority: 5,
          metadata: metadata || {
            source: 'kisanshakti-dashboard',
            requested_at: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw this.handleError(
          response.status,
          url,
          `Failed to create NDVI request: ${errorText}`,
          { tenantId, landIds, tileId }
        );
      }

      const result = await response.json();
      console.log(`✅ [NDVI-${this.version}] Analysis request created successfully`);
      return result;
    } catch (error) {
      console.error(`❌ [NDVI-${this.version}] Error creating NDVI analysis request:`, error);
      throw error;
    }
  }

  /**
   * Get the NDVI request queue for a tenant
   */
  async getRequestQueue(tenantId: string): Promise<any> {
    this.validateTenantId(tenantId);
    console.log(`📋 [NDVI-${this.version}] Fetching request queue for tenant: ${tenantId}`);
    try {
      const url = `${this.baseUrl}/ndvi/requests/queue?tenant_id=${tenantId}`;
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw this.handleError(
          response.status,
          url,
          `Failed to fetch request queue`,
          { tenantId }
        );
      }

      const result = await response.json();
      console.log(`✅ [NDVI-${this.version}] Fetched ${result.count || 0} queue items`);
      return result;
    } catch (error) {
      console.error(`❌ [NDVI-${this.version}] Error fetching NDVI request queue:`, error);
      throw error;
    }
  }

  /**
   * Get the current queue status
   */
  async getQueueStatus(): Promise<QueueStatusResponse> {
    console.log(`⚙️ [NDVI-${this.version}] Fetching queue status...`);
    try {
      const url = `${this.baseUrl}/ndvi/queue/status`;
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw this.handleError(
          response.status,
          url,
          `Failed to fetch queue status`,
          {}
        );
      }

      const result = await response.json();
      console.log(`✅ [NDVI-${this.version}] Queue status: ${result.active_jobs || 0} active jobs`);
      return result;
    } catch (error) {
      console.error(`❌ [NDVI-${this.version}] Error fetching queue status:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const renderNDVIService = new RenderNDVIService();
