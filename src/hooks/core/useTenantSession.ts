
import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentTenant, clearTenantData } from '@/store/slices/tenantSlice';

export const useTenantSession = () => {
  const dispatch = useAppDispatch();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const switchTenant = useCallback(async (tenantId: string, userTenants: any[]) => {
    const targetUserTenant = userTenants.find(ut => ut.tenant_id === tenantId);
    if (targetUserTenant?.tenant) {
      console.log('useTenantSession: Switching to tenant:', targetUserTenant.tenant);
      dispatch(setCurrentTenant(targetUserTenant.tenant));
      localStorage.setItem('currentTenantId', tenantId);
    }
  }, [dispatch]);

  const clearTenantSession = useCallback(() => {
    console.log('useTenantSession: Clearing tenant session');
    dispatch(clearTenantData());
    localStorage.removeItem('currentTenantId');
  }, [dispatch]);

  return {
    currentTenant,
    switchTenant,
    clearTenantSession,
  };
};
