
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useErrorHandler } from './useErrorHandler';

export const useQueryErrorHandler = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'observerResultsUpdated') {
        const { query } = event;
        if (query.state.error) {
          handleError(query.state.error);
        }
      }
    });

    return unsubscribe;
  }, [queryClient, handleError]);
};
