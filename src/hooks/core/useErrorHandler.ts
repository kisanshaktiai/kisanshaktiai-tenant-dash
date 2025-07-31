
import { useCallback } from 'react';
import { toast } from 'sonner';

export interface AppError {
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, fallbackMessage = 'An unexpected error occurred') => {
    console.error('Error occurred:', error);

    let errorMessage = fallbackMessage;
    
    if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      } else if ('error' in error && typeof (error as any).error === 'string') {
        errorMessage = (error as any).error;
      }
    }

    toast.error(errorMessage);
    return { message: errorMessage, handled: true };
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    fallbackMessage?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, fallbackMessage);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
};
