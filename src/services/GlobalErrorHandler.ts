
import { toast } from 'sonner';

export interface ErrorContext {
  component?: string;
  operation?: string;
  tenantId?: string;
  userId?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
}

class GlobalErrorHandler {
  private errorCount = 0;
  private errorHistory: ErrorReport[] = [];
  private maxHistorySize = 100;
  private suppressedErrors = new Set<string>();

  handleError(
    error: unknown, 
    context: ErrorContext = {},
    options: {
      showToast?: boolean;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      suppressDuplicates?: boolean;
    } = {}
  ): ErrorReport {
    const {
      showToast = true,
      severity = 'medium',
      suppressDuplicates = true
    } = options;

    // Extract error details
    const errorMessage = this.extractErrorMessage(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Create error ID for deduplication
    const errorId = this.createErrorId(errorMessage, context);
    
    // Check if error should be suppressed
    if (suppressDuplicates && this.suppressedErrors.has(errorId)) {
      console.warn('GlobalErrorHandler: Suppressing duplicate error:', errorId);
      return this.findExistingError(errorId)!;
    }

    // Create error report
    const errorReport: ErrorReport = {
      id: errorId,
      message: errorMessage,
      stack: errorStack,
      context: {
        ...context,
        timestamp: new Date().toISOString()
      },
      severity,
      handled: true
    };

    // Log error
    this.logError(errorReport);

    // Add to history
    this.addToHistory(errorReport);

    // Show user-friendly message
    if (showToast) {
      this.showUserMessage(errorReport);
    }

    // Mark as suppressed if needed
    if (suppressDuplicates) {
      this.suppressedErrors.add(errorId);
      // Auto-unsuppress after 5 minutes
      setTimeout(() => {
        this.suppressedErrors.delete(errorId);
      }, 5 * 60 * 1000);
    }

    // Handle critical errors
    if (severity === 'critical') {
      this.handleCriticalError(errorReport);
    }

    return errorReport;
  }

  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    if (error && typeof error === 'object') {
      if ('message' in error && typeof (error as any).message === 'string') {
        return (error as any).message;
      }
      if ('error' in error && typeof (error as any).error === 'string') {
        return (error as any).error;
      }
    }
    
    return 'An unknown error occurred';
  }

  private createErrorId(message: string, context: ErrorContext): string {
    const contextKey = `${context.component || ''}-${context.operation || ''}-${context.tenantId || ''}`;
    return `${contextKey}-${this.hashString(message)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private findExistingError(errorId: string): ErrorReport | undefined {
    return this.errorHistory.find(err => err.id === errorId);
  }

  private logError(errorReport: ErrorReport): void {
    const logLevel = this.getLogLevel(errorReport.severity);
    
    console[logLevel]('GlobalErrorHandler: Error reported', {
      id: errorReport.id,
      message: errorReport.message,
      context: errorReport.context,
      severity: errorReport.severity
    });

    if (errorReport.stack) {
      console[logLevel]('Error stack:', errorReport.stack);
    }
  }

  private getLogLevel(severity: string): 'error' | 'warn' | 'info' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'info';
    }
  }

  private addToHistory(errorReport: ErrorReport): void {
    this.errorHistory.unshift(errorReport);
    this.errorCount++;

    // Trim history if needed
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  private showUserMessage(errorReport: ErrorReport): void {
    const userMessage = this.getUserFriendlyMessage(errorReport);
    
    switch (errorReport.severity) {
      case 'critical':
        toast.error(userMessage, { duration: 10000 });
        break;
      case 'high':
        toast.error(userMessage, { duration: 6000 });
        break;
      case 'medium':
        toast.warning(userMessage, { duration: 4000 });
        break;
      case 'low':
        toast.info(userMessage, { duration: 2000 });
        break;
    }
  }

  private getUserFriendlyMessage(errorReport: ErrorReport): string {
    const { message, context } = errorReport;

    // Handle specific error types
    if (message.includes('Circuit breaker is open')) {
      return 'Service is temporarily unavailable. Please try again in a few moments.';
    }

    if (message.includes('Request body is required')) {
      return 'There was a problem processing your request. Please refresh the page.';
    }

    if (message.includes('Tenant ID is required')) {
      return 'Authentication issue detected. Please log in again.';
    }

    if (message.includes('Failed to call tenant data API')) {
      return 'Connection issue detected. Please check your internet connection.';
    }

    if (context.operation === 'ensure_workflow') {
      return 'There was an issue setting up your workspace. Please try again.';
    }

    // Generic messages by severity
    switch (errorReport.severity) {
      case 'critical':
        return 'A critical error occurred. Please refresh the page or contact support.';
      case 'high':
        return 'An error occurred while processing your request.';
      case 'medium':
        return 'Something went wrong. Please try again.';
      case 'low':
        return 'Minor issue detected. No action required.';
      default:
        return message;
    }
  }

  private handleCriticalError(errorReport: ErrorReport): void {
    // For critical errors, we might want to:
    // 1. Clear certain caches
    // 2. Reset component states
    // 3. Redirect to safe page
    
    console.error('CRITICAL ERROR DETECTED:', errorReport);
    
    // Could implement automatic recovery strategies here
    if (errorReport.context.component === 'TenantDataService') {
      // Clear any cached data that might be causing issues
      console.log('Clearing tenant data caches due to critical error');
    }
  }

  // Public methods for monitoring
  getErrorHistory(): ErrorReport[] {
    return [...this.errorHistory];
  }

  getErrorCount(): number {
    return this.errorCount;
  }

  clearHistory(): void {
    this.errorHistory = [];
    this.errorCount = 0;
    this.suppressedErrors.clear();
  }

  // Method to check system health
  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'critical';
    recentErrors: number;
    criticalErrors: number;
  } {
    const recentErrors = this.errorHistory.filter(
      err => Date.now() - new Date(err.context.timestamp!).getTime() < 5 * 60 * 1000
    ).length;

    const criticalErrors = this.errorHistory.filter(
      err => err.severity === 'critical'
    ).length;

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (criticalErrors > 0) {
      status = 'critical';
    } else if (recentErrors > 10) {
      status = 'degraded';
    }

    return {
      status,
      recentErrors,
      criticalErrors
    };
  }
}

export const globalErrorHandler = new GlobalErrorHandler();
