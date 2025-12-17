/**
 * Secure Logger Service
 * Filters sensitive data from logs and provides structured logging
 * Prevents accidental exposure of PII, tokens, and credentials
 */

import { isDevelopment } from '@/config/api.config';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// Sensitive field patterns to redact
const SENSITIVE_PATTERNS = {
  // API keys and tokens
  apiKey: /api[_-]?key/i,
  token: /token|jwt|bearer/i,
  secret: /secret|password|passwd|pwd/i,
  credential: /credential|auth/i,
  
  // Personal information
  email: /email/i,
  phone: /phone|mobile|cell/i,
  ssn: /ssn|social.*security/i,
  
  // Financial
  card: /card|credit|debit|cvv|cvc/i,
  account: /account.*number|routing/i,
  
  // Supabase specific
  supabase: /supabase.*key|service.*role/i,
};

// Values that look like sensitive data
const SENSITIVE_VALUE_PATTERNS = [
  /^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/,  // JWT
  /^sk[_-][a-zA-Z0-9]+$/,                                  // Stripe-style keys
  /^[a-f0-9]{32,}$/i,                                      // Long hex strings
  /^[A-Za-z0-9+/]{40,}={0,2}$/,                           // Base64 encoded data
];

// Configuration
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  redactSensitive: boolean;
  maxPayloadSize: number;
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: isDevelopment() ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableRemote: false, // Enable for production error tracking
  redactSensitive: true,
  maxPayloadSize: 10000, // Max characters for logged payloads
};

class SecureLogger {
  private config: LoggerConfig;
  private logBuffer: Array<{ level: LogLevel; message: string; data?: unknown; timestamp: Date }> = [];
  private maxBufferSize = 100;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if field name is sensitive
   */
  private isSensitiveField(fieldName: string): boolean {
    return Object.values(SENSITIVE_PATTERNS).some(pattern => pattern.test(fieldName));
  }

  /**
   * Check if value looks like sensitive data
   */
  private isSensitiveValue(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return SENSITIVE_VALUE_PATTERNS.some(pattern => pattern.test(value));
  }

  /**
   * Redact sensitive data from an object
   */
  private redactSensitiveData(data: unknown, depth = 0): unknown {
    if (depth > 10) return '[MAX_DEPTH_EXCEEDED]';

    if (data === null || data === undefined) return data;

    // Handle primitives
    if (typeof data !== 'object') {
      if (this.isSensitiveValue(data)) {
        return '[REDACTED]';
      }
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.redactSensitiveData(item, depth + 1));
    }

    // Handle objects
    const redacted: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (this.isSensitiveField(key)) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'string' && this.isSensitiveValue(value)) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactSensitiveData(value, depth + 1);
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }

  /**
   * Truncate large payloads
   */
  private truncatePayload(data: unknown): unknown {
    const stringified = JSON.stringify(data);
    
    if (stringified.length > this.config.maxPayloadSize) {
      return {
        _truncated: true,
        _originalSize: stringified.length,
        preview: stringified.substring(0, 500) + '...',
      };
    }

    return data;
  }

  /**
   * Format log message
   */
  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    
    let formatted = `[${timestamp}] [${levelName}] ${message}`;
    
    if (data !== undefined) {
      const safeData = this.config.redactSensitive 
        ? this.redactSensitiveData(data) 
        : data;
      const truncated = this.truncatePayload(safeData);
      formatted += ` ${JSON.stringify(truncated)}`;
    }

    return formatted;
  }

  /**
   * Add to log buffer
   */
  private addToBuffer(level: LogLevel, message: string, data?: unknown): void {
    this.logBuffer.push({
      level,
      message,
      data: this.config.redactSensitive ? this.redactSensitiveData(data) : data,
      timestamp: new Date(),
    });

    // Trim buffer if too large
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (level < this.config.level) return;

    const formatted = this.formatMessage(level, message, data);
    this.addToBuffer(level, message, data);

    if (this.config.enableConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.ERROR:
          console.error(formatted);
          break;
      }
    }
  }

  // Public logging methods
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log API request (with sensitive data redaction)
   */
  logApiRequest(
    method: string,
    url: string,
    options?: { body?: unknown; headers?: Record<string, string> }
  ): void {
    this.info(`API Request: ${method} ${url}`, {
      body: options?.body,
      headers: options?.headers ? this.redactSensitiveData(options.headers) : undefined,
    });
  }

  /**
   * Log API response (with sensitive data redaction)
   */
  logApiResponse(
    method: string,
    url: string,
    status: number,
    duration: number,
    data?: unknown
  ): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API Response: ${method} ${url} - ${status} (${duration}ms)`, data);
  }

  /**
   * Log error with stack trace
   */
  logError(error: Error, context?: Record<string, unknown>): void {
    this.error(error.message, {
      name: error.name,
      stack: error.stack,
      ...context,
    });
  }

  /**
   * Get log buffer for debugging
   */
  getLogBuffer(): Array<{ level: LogLevel; message: string; timestamp: Date }> {
    return this.logBuffer.map(({ level, message, timestamp }) => ({
      level,
      message,
      timestamp,
    }));
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, unknown>): SecureLogger {
    const childLogger = new SecureLogger(this.config);
    const originalLog = childLogger.log.bind(childLogger);
    
    childLogger.log = (level: LogLevel, message: string, data?: unknown) => {
      originalLog(level, message, { ...context, ...(data as Record<string, unknown>) });
    };

    return childLogger;
  }
}

// Export singleton instance
export const secureLogger = new SecureLogger();

// Export convenience functions
export const logDebug = (message: string, data?: unknown) => secureLogger.debug(message, data);
export const logInfo = (message: string, data?: unknown) => secureLogger.info(message, data);
export const logWarn = (message: string, data?: unknown) => secureLogger.warn(message, data);
export const logError = (message: string, data?: unknown) => secureLogger.error(message, data);

export default secureLogger;
