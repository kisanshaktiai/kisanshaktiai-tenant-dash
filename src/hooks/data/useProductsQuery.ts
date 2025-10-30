
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category_id: string;
  price_per_unit: number;
  stock_quantity: number;
  availability_status: string;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  unit_type: string;
  created_at: string;
  tenant_id: string;
  // Agricultural specific fields
  product_type: 'fertilizer' | 'pesticide' | 'medicine' | 'seed' | 'equipment' | 'general';
  is_organic: boolean;
  active_ingredients: string[];
  dosage_instructions?: string;
  application_method?: string;
  safety_precautions?: string;
  target_pests: string[];
  target_diseases: string[];
  suitable_crops: string[];
  nutrient_composition: Record<string, any>;
  ph_range?: string;
  solubility?: string;
  waiting_period_days?: number;
  shelf_life_months?: number;
  storage_conditions?: string;
  manufacturer?: string;
  batch_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  certification_details: Record<string, any>;
  minimum_stock_level: number;
  reorder_point: number;
  last_restocked_at?: string;
  stock_movement_history: any[];
}

export interface ProductsListOptions {
  search?: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export const useProductsQuery = (options: ProductsListOptions = {}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.productsList(currentTenant?.id || ''),
    queryFn: async () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }

      let query = supabase
        .from('products')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (options.search) {
        query = query.or(`name.ilike.%${options.search}%,sku.ilike.%${options.search}%,brand.ilike.%${options.search}%`);
      }

      if (options.status && options.status !== 'all') {
        query = query.eq('availability_status', options.status);
      }

      if (options.category && options.category !== 'all') {
        query = query.eq('category_id', options.category);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        data: data as Product[],
        count: count || 0
      };
    },
    enabled: !!currentTenant,
  });
};

export const useProductQuery = (productId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.product(productId, currentTenant?.id || ''),
    queryFn: async () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('tenant_id', currentTenant.id)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!currentTenant && !!productId,
  });
};
