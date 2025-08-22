
import { useQuery } from '@tanstack/react-query';
import { useTenantBusinessLogic } from './useTenantBusinessLogic';
import { useGlobalErrorHandler } from './useGlobalErrorHandler';
import { useAppSelector } from '@/store/hooks';

export const useTenantDataWithRepository = (userId?: string) => {
  const businessLogic = useTenantBusinessLogic();
  const { handleAsyncError } = useGlobalErrorHandler();
  const { user } = useAppSelector((state) => state.auth);
  
  const effectiveUserId = userId || user?.id;

  return useQuery({
    queryKey: ['tenant-data-repository', effectiveUserId],
    queryFn: () => handleAsyncError(
      () => businessLogic.getUserTenants(effectiveUserId!),
      'fetch-user-tenants'
    ),
    enabled: !!effectiveUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
