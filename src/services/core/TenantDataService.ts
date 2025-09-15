/**
 * Centralized Tenant Data Service
 * Handles all tenant-scoped data fetching with consistent patterns
 */

import { supabase } from '@/integrations/supabase/client';

// Whitelisted tables that can be accessed through this service
const ALLOWED_TABLES = [
  'farmers',
  'user_profiles',
  'lands',
  'dealers',
  'products',
  'campaigns',
  'campaign_executions',
  'campaign_segments',
  'weather_alerts',
  'ndvi_data',
  'engagements',
  'notifications',
  'bulk_operations',
  'campaign_analytics',
  'campaign_automations',
  'campaign_templates'
] as const;

export type AllowedTable = typeof ALLOWED_TABLES[number];

export interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  select?: string;
  includeRelations?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export class TenantDataService {
  /**
   * Validates that the requested table is allowed
   */
  private static validateTable(tableName: string): tableName is AllowedTable {
    return ALLOWED_TABLES.includes(tableName as AllowedTable);
  }

  /**
   * Build the select string with relations
   */
  private static buildSelectString(baseSelect: string = '*', relations?: string[]): string {
    if (!relations || relations.length === 0) {
      return baseSelect;
    }
    
    const relationSelects = relations.map(rel => `${rel}(*)`).join(', ');
    return `${baseSelect}, ${relationSelects}`;
  }

  /**
   * Apply filters to a query
   */
  private static applyFilters(query: any, filters: Record<string, any>) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }

      // Handle different filter types
      if (key.endsWith('_min')) {
        const field = key.replace('_min', '');
        query = query.gte(field, value);
      } else if (key.endsWith('_max')) {
        const field = key.replace('_max', '');
        query = query.lte(field, value);
      } else if (key.endsWith('_like')) {
        const field = key.replace('_like', '');
        query = query.ilike(field, `%${value}%`);
      } else if (Array.isArray(value)) {
        query = query.in(key, value);
      } else if (typeof value === 'boolean') {
        query = query.eq(key, value);
      } else {
        query = query.eq(key, value);
      }
    });

    return query;
  }

  /**
   * Apply search to a query
   */
  private static applySearch(query: any, search: string, searchFields: string[] = []) {
    if (!search || searchFields.length === 0) {
      return query;
    }

    // Build OR conditions for search
    const searchConditions = searchFields
      .map(field => `${field}.ilike.%${search}%`)
      .join(',');
    
    return query.or(searchConditions);
  }

  /**
   * Fetch paginated tenant data from any allowed table
   */
  static async fetchTenantTableData<T = any>(
    tableName: string,
    tenantId: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    // Validate table name
    if (!this.validateTable(tableName)) {
      throw new Error(`Access to table '${tableName}' is not allowed`);
    }

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const {
      page = 1,
      limit = 20,
      search,
      searchFields = [],
      sortBy = 'created_at',
      sortOrder = 'desc',
      filters = {},
      select = '*',
      includeRelations = []
    } = options;

    const offset = (page - 1) * limit;
    const selectString = this.buildSelectString(select, includeRelations);

    // Build the base query with tenant isolation - use any to avoid type issues
    let query: any = supabase
      .from(tableName as any)
      .select(selectString, { count: 'exact' })
      .eq('tenant_id', tenantId);

    // Apply filters
    query = this.applyFilters(query, filters);

    // Apply search
    if (search && searchFields.length > 0) {
      query = this.applySearch(query, search, searchFields);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error(`Error fetching ${tableName} data:`, error);
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: (data || []) as T[],
      count: count || 0,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Fetch a single record by ID with tenant validation
   */
  static async fetchTenantRecord<T = any>(
    tableName: string,
    recordId: string,
    tenantId: string,
    options: { select?: string; includeRelations?: string[] } = {}
  ): Promise<T | null> {
    if (!this.validateTable(tableName)) {
      throw new Error(`Access to table '${tableName}' is not allowed`);
    }

    if (!tenantId || !recordId) {
      throw new Error('Tenant ID and Record ID are required');
    }

    const { select = '*', includeRelations = [] } = options;
    const selectString = this.buildSelectString(select, includeRelations);

    const { data, error } = await supabase
      .from(tableName as any)
      .select(selectString)
      .eq('id', recordId)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Record not found
      }
      console.error(`Error fetching ${tableName} record:`, error);
      throw error;
    }

    return data as T;
  }

  /**
   * Create a new record with tenant isolation
   */
  static async createTenantRecord<T = any>(
    tableName: string,
    data: Omit<T, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>,
    tenantId: string
  ): Promise<T> {
    if (!this.validateTable(tableName)) {
      throw new Error(`Access to table '${tableName}' is not allowed`);
    }

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const { data: result, error } = await supabase
      .from(tableName as any)
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${tableName} record:`, error);
      throw error;
    }

    return result as T;
  }

  /**
   * Update a record with tenant validation
   */
  static async updateTenantRecord<T = any>(
    tableName: string,
    recordId: string,
    updates: Partial<T>,
    tenantId: string
  ): Promise<T> {
    if (!this.validateTable(tableName)) {
      throw new Error(`Access to table '${tableName}' is not allowed`);
    }

    if (!tenantId || !recordId) {
      throw new Error('Tenant ID and Record ID are required');
    }

    const { data, error } = await supabase
      .from(tableName as any)
      .update(updates)
      .eq('id', recordId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${tableName} record:`, error);
      throw error;
    }

    return data as T;
  }

  /**
   * Delete a record with tenant validation
   */
  static async deleteTenantRecord(
    tableName: string,
    recordId: string,
    tenantId: string
  ): Promise<void> {
    if (!this.validateTable(tableName)) {
      throw new Error(`Access to table '${tableName}' is not allowed`);
    }

    if (!tenantId || !recordId) {
      throw new Error('Tenant ID and Record ID are required');
    }

    const { error } = await supabase
      .from(tableName as any)
      .delete()
      .eq('id', recordId)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error(`Error deleting ${tableName} record:`, error);
      throw error;
    }
  }

  /**
   * Count records with filters
   */
  static async countTenantRecords(
    tableName: string,
    tenantId: string,
    filters: Record<string, any> = {}
  ): Promise<number> {
    if (!this.validateTable(tableName)) {
      throw new Error(`Access to table '${tableName}' is not allowed`);
    }

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    let query: any = supabase
      .from(tableName as any)
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    query = this.applyFilters(query, filters);

    const { count, error } = await query;

    if (error) {
      console.error(`Error counting ${tableName} records:`, error);
      throw error;
    }

    return count || 0;
  }

  /**
   * Batch fetch records by IDs
   */
  static async fetchTenantRecordsByIds<T = any>(
    tableName: string,
    recordIds: string[],
    tenantId: string,
    options: { select?: string; includeRelations?: string[] } = {}
  ): Promise<T[]> {
    if (!this.validateTable(tableName)) {
      throw new Error(`Access to table '${tableName}' is not allowed`);
    }

    if (!tenantId || recordIds.length === 0) {
      return [];
    }

    const { select = '*', includeRelations = [] } = options;
    const selectString = this.buildSelectString(select, includeRelations);

    const { data, error } = await supabase
      .from(tableName as any)
      .select(selectString)
      .in('id', recordIds)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error(`Error batch fetching ${tableName} records:`, error);
      throw error;
    }

    return (data || []) as T[];
  }
}

export default TenantDataService;