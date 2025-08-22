
import { useMemo } from 'react';
import { TenantRepository } from '@/repositories/TenantRepository';
import { TenantBusinessLogic } from '@/services/business/TenantBusinessLogic';

export const useTenantBusinessLogic = () => {
  const businessLogic = useMemo(() => {
    const repository = new TenantRepository();
    return new TenantBusinessLogic(repository);
  }, []);

  return businessLogic;
};
