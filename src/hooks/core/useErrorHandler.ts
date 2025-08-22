import { useGlobalErrorHandler } from './useGlobalErrorHandler';

export const useErrorHandler = () => {
  const { handleError, handleAsyncError } = useGlobalErrorHandler();
  
  return {
    handleError,
    handleAsyncError,
  };
};

export interface AppError {
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}
