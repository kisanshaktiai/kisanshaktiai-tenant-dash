/**
 * Client-Side Rate Limiting Service
 * Implements request throttling and exponential backoff
 * Protects against accidental API abuse and handles server overload gracefully
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
  lastRequest: number;
}

interface RateLimitConfig {
  maxRequests: number;      // Max requests per window
  windowMs: number;         // Window duration in ms
  minInterval: number;      // Minimum ms between requests
  maxRetries: number;       // Max retry attempts
  baseRetryDelay: number;   // Base delay for exponential backoff
}

// Default configurations for different API types
const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  default: {
    maxRequests: 100,
    windowMs: 60000,      // 1 minute
    minInterval: 100,     // 100ms between requests
    maxRetries: 3,
    baseRetryDelay: 1000,
  },
  ndvi: {
    maxRequests: 30,
    windowMs: 60000,      // 1 minute
    minInterval: 500,     // 500ms between requests
    maxRetries: 3,
    baseRetryDelay: 2000,
  },
  soil: {
    maxRequests: 30,
    windowMs: 60000,      // 1 minute  
    minInterval: 500,     // 500ms between requests
    maxRetries: 3,
    baseRetryDelay: 2000,
  },
  auth: {
    maxRequests: 10,
    windowMs: 60000,      // 1 minute
    minInterval: 1000,    // 1s between requests
    maxRetries: 2,
    baseRetryDelay: 3000,
  },
  upload: {
    maxRequests: 20,
    windowMs: 60000,      // 1 minute
    minInterval: 200,     // 200ms between requests
    maxRetries: 2,
    baseRetryDelay: 2000,
  },
};

class RateLimitService {
  private limits: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  constructor() {
    // Initialize with default configs
    Object.entries(DEFAULT_CONFIGS).forEach(([key, config]) => {
      this.configs.set(key, config);
    });

    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get or create rate limit config for a key
   */
  private getConfig(key: string): RateLimitConfig {
    // Check for specific config first
    const specificKey = key.split(':')[0]; // e.g., 'ndvi:health' -> 'ndvi'
    return this.configs.get(specificKey) || this.configs.get('default')!;
  }

  /**
   * Get or create rate limit entry for a key
   */
  private getEntry(key: string): RateLimitEntry {
    const now = Date.now();
    let entry = this.limits.get(key);

    if (!entry) {
      entry = { count: 0, windowStart: now, lastRequest: 0 };
      this.limits.set(key, entry);
    }

    // Reset window if expired
    const config = this.getConfig(key);
    if (now - entry.windowStart >= config.windowMs) {
      entry.count = 0;
      entry.windowStart = now;
    }

    return entry;
  }

  /**
   * Check if request is allowed
   */
  canRequest(key: string): { allowed: boolean; retryAfter?: number } {
    const config = this.getConfig(key);
    const entry = this.getEntry(key);
    const now = Date.now();

    // Check rate limit
    if (entry.count >= config.maxRequests) {
      const retryAfter = config.windowMs - (now - entry.windowStart);
      return { allowed: false, retryAfter };
    }

    // Check minimum interval
    const timeSinceLastRequest = now - entry.lastRequest;
    if (timeSinceLastRequest < config.minInterval) {
      return { allowed: false, retryAfter: config.minInterval - timeSinceLastRequest };
    }

    return { allowed: true };
  }

  /**
   * Record a request
   */
  recordRequest(key: string): void {
    const entry = this.getEntry(key);
    entry.count++;
    entry.lastRequest = Date.now();
  }

  /**
   * Wait for rate limit to allow request
   */
  async waitForSlot(key: string): Promise<void> {
    const check = this.canRequest(key);
    if (check.allowed) return;

    if (check.retryAfter) {
      await new Promise(resolve => setTimeout(resolve, check.retryAfter));
    }
  }

  /**
   * Execute request with rate limiting and deduplication
   */
  async executeWithLimit<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: { deduplicate?: boolean } = {}
  ): Promise<T> {
    // Deduplication - return existing promise if same request is in flight
    if (options.deduplicate && this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Wait for rate limit slot
    await this.waitForSlot(key);

    // Record the request
    this.recordRequest(key);

    // Execute and track
    const promise = requestFn();
    
    if (options.deduplicate) {
      this.pendingRequests.set(key, promise);
      promise.finally(() => this.pendingRequests.delete(key));
    }

    return promise;
  }

  /**
   * Execute request with exponential backoff retry
   */
  async executeWithRetry<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: {
      shouldRetry?: (error: unknown) => boolean;
      onRetry?: (attempt: number, delay: number, error: unknown) => void;
    } = {}
  ): Promise<T> {
    const config = this.getConfig(key);
    let lastError: unknown;

    for (let attempt = 0; attempt < config.maxRetries; attempt++) {
      try {
        return await this.executeWithLimit(key, requestFn);
      } catch (error) {
        lastError = error;

        // Check if we should retry
        const shouldRetry = options.shouldRetry?.(error) ?? this.isRetryableError(error);
        
        if (!shouldRetry || attempt === config.maxRetries - 1) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = config.baseRetryDelay * Math.pow(2, attempt);
        
        // Notify about retry
        options.onRetry?.(attempt + 1, delay, error);

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      // Network errors
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        return true;
      }
      
      // Rate limit or server errors
      if (error.message.includes('429') || 
          error.message.includes('503') || 
          error.message.includes('504')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Cleanup old entries
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [key, entry] of this.limits.entries()) {
      if (now - entry.windowStart > maxAge) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Get current status for a key
   */
  getStatus(key: string): {
    remaining: number;
    total: number;
    resetAt: number;
  } {
    const config = this.getConfig(key);
    const entry = this.getEntry(key);

    return {
      remaining: Math.max(0, config.maxRequests - entry.count),
      total: config.maxRequests,
      resetAt: entry.windowStart + config.windowMs,
    };
  }

  /**
   * Set custom config for a key
   */
  setConfig(key: string, config: Partial<RateLimitConfig>): void {
    const defaultConfig = this.configs.get('default')!;
    this.configs.set(key, { ...defaultConfig, ...config });
  }

  /**
   * Reset limits for a key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Reset all limits
   */
  resetAll(): void {
    this.limits.clear();
  }
}

// Export singleton instance
export const rateLimitService = new RateLimitService();

// Export helper function for common use case
export async function withRateLimit<T>(
  key: string,
  requestFn: () => Promise<T>,
  options?: { deduplicate?: boolean }
): Promise<T> {
  return rateLimitService.executeWithLimit(key, requestFn, options);
}

// Export helper for retry with backoff
export async function withRetry<T>(
  key: string,
  requestFn: () => Promise<T>,
  options?: {
    shouldRetry?: (error: unknown) => boolean;
    onRetry?: (attempt: number, delay: number, error: unknown) => void;
  }
): Promise<T> {
  return rateLimitService.executeWithRetry(key, requestFn, options);
}

export default rateLimitService;
