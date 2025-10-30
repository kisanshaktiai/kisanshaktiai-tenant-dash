
import { useCallback } from 'react';
import { globalErrorHandler, ErrorContext } from '@/services/GlobalErrorHandler';

export interface AppError {
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

export const useErrorHandler = (defaultContext: ErrorContext = {}) => {
  const handleError = useCallback((
    error: unknown, 
    fallbackMessage = 'An unexpected error occurred',
    context: ErrorContext = {}
  ) => {
    const mergedContext = { ...defaultContext, ...context };
    
    const errorReport = globalErrorHandler.handleError(error, mergedContext, {
      showToast: true,
      severity: 'medium',
      suppressDuplicates: true
    });

    return { 
      message: errorReport.message, 
      handled: true,
      errorId: errorReport.id 
    };
  }, [defaultContext]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    fallbackMessage?: string,
    context: ErrorContext = {}
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, fallbackMessage, context);
      return null;
    }
  }, [handleError]);

  const handleCriticalError = useCallback((
    error: unknown,
    context: ErrorContext = {}
  ) => {
    const mergedContext = { ...defaultContext, ...context };
    
    return globalErrorHandler.handleError(error, mergedContext, {
      showToast: true,
      severity: 'critical',
      suppressDuplicates: false
    });
  }, [defaultContext]);

  return {
    handleError,
    handleAsyncError,
    handleCriticalError,
  };
};
