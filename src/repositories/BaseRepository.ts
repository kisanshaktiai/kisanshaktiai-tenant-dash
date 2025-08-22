
import { supabase } from '@/integrations/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';

export interface RepositoryOptions {
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export interface RepositoryError {
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

export abstract class BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected handleError(error: PostgrestError | Error): RepositoryError {
    if ('code' in error && 'message' in error) {
      return {
        message: error.message,
        code: error.code,
        details: error.details,
        statusCode: 400,
      };
    }
    
    return {
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
    };
  }

  protected async executeQuery<R>(
    queryFn: () => Promise<{ data: R | null; error: PostgrestError | null }>
  ): Promise<R> {
    const { data, error } = await queryFn();
    
    if (error) {
      throw this.handleError(error);
    }
    
    if (data === null) {
      throw new Error('No data returned from query');
    }
    
    return data;
  }

  async findById(id: string, options: RepositoryOptions = {}): Promise<T> {
    const selectFields = options.select || '*';
    
    return this.executeQuery<T>(async () => {
      return await supabase
        .from(this.tableName as any)
        .select(selectFields)
        .eq('id', id)
        .single();
    });
  }

  async findAll(options: RepositoryOptions = {}): Promise<T[]> {
    const selectFields = options.select || '*';
    
    return this.executeQuery<T[]>(async () => {
      let query = supabase
        .from(this.tableName as any)
        .select(selectFields);
      
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        });
      }
      
      if (options.limit) {
        const start = options.offset || 0;
        query = query.range(start, start + options.limit - 1);
      }
      
      return await query;
    });
  }

  async create(data: Partial<T>): Promise<T> {
    return this.executeQuery<T>(async () => 
      await supabase
        .from(this.tableName as any)
        .insert(data)
        .select()
        .single()
    );
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.executeQuery<T>(async () => 
      await supabase
        .from(this.tableName as any)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
    );
  }

  async delete(id: string): Promise<void> {
    await this.executeQuery<void>(async () => 
      await supabase
        .from(this.tableName as any)
        .delete()
        .eq('id', id)
    );
  }
}
