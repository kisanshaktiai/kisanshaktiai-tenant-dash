
import { useProductsQuery, type ProductsListOptions } from './useProductsQuery';
import { useTenantRealtime } from './useTenantRealtime';

export const useRealTimeProductsQuery = (options: ProductsListOptions = {}) => {
  const productsQuery = useProductsQuery(options);
  const { isConnected, activeChannels, lastUpdate } = useTenantRealtime();

  return {
    ...productsQuery,
    isLive: isConnected,
    activeChannels,
    lastUpdate
  };
};
