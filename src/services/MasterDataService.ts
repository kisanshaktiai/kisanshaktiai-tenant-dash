
import { supabase } from '@/integrations/supabase/client';

export interface MasterCompany {
  id: string;
  name: string;
  slug: string;
  company_type: string;
  description?: string;
  certifications?: any;
  metadata?: any;
}

export interface MasterProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  is_active: boolean;
  metadata?: any;
}

export interface MasterProduct {
  id: string;
  company_id?: string;
  category_id?: string;
  sku: string;
  name: string;
  brand?: string;
  product_type?: string;
  description?: string;
  images?: any;
  price_per_unit?: number;
  unit_of_measure?: string;
  organic_certified?: boolean;
  quality_certifications?: any;
  packaging_options?: any;
  metadata?: any;
  company?: MasterCompany;
  category?: MasterProductCategory;
}

export interface MasterDataFilters {
  company_id?: string;
  category_id?: string;
  product_type?: string;
  organic_certified?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
}

class MasterDataService {
  async getCompanies() {
    const { data, error } = await supabase
      .from('master_companies')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as MasterCompany[];
  }

  async getCategories(parentId?: string | null) {
    let query = supabase
      .from('master_product_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (parentId !== undefined) {
      query = parentId ? query.eq('parent_id', parentId) : query.is('parent_id', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as MasterProductCategory[];
  }

  async getCategoryTree() {
    const { data, error } = await supabase
      .from('master_product_categories')
      .select('id, name, slug, description, icon, parent_id, is_active, metadata')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    // Build tree structure
    const categories = data as MasterProductCategory[];
    const rootCategories = categories.filter(cat => !cat.parent_id);
    const categoryMap = new Map(categories.map(cat => [cat.id, { ...cat, children: [] as any[] }]));

    categories.forEach(cat => {
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        categoryMap.get(cat.parent_id)!.children.push(categoryMap.get(cat.id));
      }
    });

    return rootCategories.map(cat => categoryMap.get(cat.id));
  }

  async getProducts(filters: MasterDataFilters = {}, page = 1, limit = 50) {
    const from = (page - 1) * limit;
    
    let query = supabase
      .from('master_products')
      .select(`
        id, sku, name, brand, product_type, description, images, 
        price_per_unit, unit_of_measure, organic_certified, 
        quality_certifications, packaging_options, metadata, company_id, category_id,
        company:company_id(id, name, company_type),
        category:category_id(id, name, slug)
      `, { count: 'exact' });

    // Apply filters
    const filterConditions: any = {};
    if (filters.company_id) filterConditions.company_id = filters.company_id;
    if (filters.category_id) filterConditions.category_id = filters.category_id;
    if (filters.product_type) filterConditions.product_type = filters.product_type;
    if (filters.organic_certified !== undefined) filterConditions.organic_certified = filters.organic_certified;

    // Apply match filters
    if (Object.keys(filterConditions).length > 0) {
      query = query.match(filterConditions);
    }

    // Apply search
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    // Apply price filters
    if (filters.min_price !== undefined) {
      query = query.gte('price_per_unit', filters.min_price);
    }
    if (filters.max_price !== undefined) {
      query = query.lte('price_per_unit', filters.max_price);
    }

    // Apply pagination and ordering
    query = query.range(from, from + limit - 1).order('name');

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      products: (data || []) as any as MasterProduct[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('master_products')
      .select(`
        *,
        company:company_id(*),
        category:category_id(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as any as MasterProduct;
  }

  async getCategoryById(id: string) {
    const { data, error } = await supabase
      .from('master_product_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as MasterProductCategory;
  }
}

export const masterDataService = new MasterDataService();
