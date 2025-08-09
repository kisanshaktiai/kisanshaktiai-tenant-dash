
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

interface RetryConfig {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

interface RetryableState {
  attempt: number;
  isRetrying: boolean;
  lastError?: Error;
}

export const useRetryableMutation = <TData, TError, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>,
  retryConfig: RetryConfig = {}
) => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = retryConfig;

  const [retryState, setRetryState] = useState<RetryableState>({
    attempt: 0,
    isRetrying: false,
  });

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const calculateDelay = (attempt: number) => {
    const exponentialDelay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
    return Math.min(exponentialDelay, maxDelay);
  };

  const mutation = useMutation({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      let lastError: Error;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          setRetryState({ attempt, isRetrying: attempt > 1 });
          
          if (attempt > 1) {
            const delayMs = calculateDelay(attempt - 1);
            await delay(delayMs);
          }
          
          const result = await mutationFn(variables);
          setRetryState({ attempt: 0, isRetrying: false });
          return result;
        } catch (error) {
          lastError = error as Error;
          setRetryState({ 
            attempt, 
            isRetrying: attempt < maxAttempts,
            lastError 
          });
          
          if (attempt === maxAttempts) {
            throw error;
          }
        }
      }
      
      throw lastError!;
    },
    ...options,
  });

  const retry = useCallback(() => {
    if (mutation.variables) {
      mutation.mutate(mutation.variables);
    }
  }, [mutation]);

  return {
    ...mutation,
    retry,
    retryState,
  };
};
