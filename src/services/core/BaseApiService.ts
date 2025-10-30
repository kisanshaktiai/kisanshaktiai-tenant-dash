
import { supabase } from '@/integrations/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';

export interface ApiError extends Error {
  code?: string;
  details?: any;
  statusCode?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortOptions {
  column: string;
  ascending?: boolean;
}

export interface FilterOptions {
  [key: string]: any;
}

export abstract class BaseApiService {
  protected handleError(error: PostgrestError | Error | unknown): ApiError {
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      // PostgrestError
      const pgError = error as PostgrestError;
      const apiError = new Error(pgError.message) as ApiError;
      apiError.code = pgError.code;
      apiError.details = pgError.details;
      apiError.statusCode = 400;
      return apiError;
    }
    
    if (error instanceof Error) {
      const apiError = new Error(error.message) as ApiError;
      apiError.statusCode = 500;
      return apiError;
    }
    
    const apiError = new Error('An unexpected error occurred') as ApiError;
    apiError.statusCode = 500;
    return apiError;
  }

  protected async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>
  ): Promise<T> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        throw this.handleError(error);
      }
      
      if (data === null) {
        throw new Error('No data returned from query');
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw this.handleError(error);
    }
  }

  protected buildFilters(query: any, filters: FilterOptions) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'string' && value.includes('*')) {
          query = query.like(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });
    return query;
  }

  protected applyPagination(query: any, options: PaginationOptions) {
    const { page = 1, limit = 50, offset } = options;
    
    if (offset !== undefined) {
      return query.range(offset, offset + limit - 1);
    }
    
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    return query.range(start, end);
  }

  protected applySorting(query: any, sort: SortOptions) {
    return query.order(sort.column, { ascending: sort.ascending ?? true });
  }
}
