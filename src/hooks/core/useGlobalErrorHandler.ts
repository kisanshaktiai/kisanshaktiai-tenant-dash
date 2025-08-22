
import { useCallback } from 'react';
import { useErrorBoundary } from '@/contexts/ErrorBoundaryContext';
import type { RepositoryError } from '@/repositories/BaseRepository';

export const useGlobalErrorHandler = () => {
  const { reportError } = useErrorBoundary();

  const handleError = useCallback((error: unknown, context?: string) => {
    return reportError(error, context);
  }, [reportError]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    fallbackValue?: T
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return fallbackValue || null;
    }
  }, [handleError]);

  const handleRepositoryError = useCallback((error: RepositoryError, context?: string) => {
    return reportError({
      message: error.message,
      code: error.code,
      details: error.details,
      statusCode: error.statusCode,
    }, context);
  }, [reportError]);

  const wrapAsyncFunction = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ) => {
    return async (...args: T): Promise<R | null> => {
      return handleAsyncError(() => fn(...args), context);
    };
  }, [handleAsyncError]);

  return {
    handleError,
    handleAsyncError,
    handleRepositoryError,
    wrapAsyncFunction,
  };
};
