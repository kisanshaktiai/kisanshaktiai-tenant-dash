
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

export interface AppError {
  id: string;
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
  timestamp: Date;
  context?: string;
}

interface ErrorBoundaryContextType {
  errors: AppError[];
  reportError: (error: unknown, context?: string) => AppError;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

const ErrorBoundaryContext = createContext<ErrorBoundaryContextType | null>(null);

export const useErrorBoundary = () => {
  const context = useContext(ErrorBoundaryContext);
  if (!context) {
    throw new Error('useErrorBoundary must be used within an ErrorBoundaryProvider');
  }
  return context;
};

interface ErrorBoundaryProviderProps {
  children: ReactNode;
  maxErrors?: number;
  showToasts?: boolean;
}

export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({ 
  children, 
  maxErrors = 10,
  showToasts = true 
}) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const reportError = useCallback((error: unknown, context?: string): AppError => {
    console.error('Error reported:', error, { context });

    const appError: AppError = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: getErrorMessage(error),
      code: getErrorCode(error),
      details: error,
      statusCode: getErrorStatusCode(error),
      timestamp: new Date(),
      context,
    };

    setErrors(prev => {
      const newErrors = [appError, ...prev].slice(0, maxErrors);
      return newErrors;
    });

    if (showToasts) {
      toast.error(appError.message);
    }

    // Log to external service if available
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Error Occurred', {
        errorId: appError.id,
        message: appError.message,
        code: appError.code,
        context: appError.context,
      });
    }

    return appError;
  }, [maxErrors, showToasts]);

  const clearError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const value: ErrorBoundaryContextType = {
    errors,
    reportError,
    clearError,
    clearAllErrors,
    hasErrors: errors.length > 0,
  };

  return (
    <ErrorBoundaryContext.Provider value={value}>
      {children}
    </ErrorBoundaryContext.Provider>
  );
};

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('error' in error && typeof (error as any).error === 'string') {
      return (error as any).error;
    }
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code);
  }
  return undefined;
}

function getErrorStatusCode(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return error.statusCode;
    }
    if ('status' in error && typeof error.status === 'number') {
      return error.status;
    }
  }
  return undefined;
}
