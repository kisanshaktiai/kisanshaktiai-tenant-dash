
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

  protected createQuery(options: RepositoryOptions = {}) {
    let query = supabase.from(this.tableName);
    
    if (options.select) {
      query = query.select(options.select);
    } else {
      query = query.select('*');
    }
    
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      });
    }
    
    if (options.limit) {
      const start = options.offset || 0;
      query = query.range(start, start + options.limit - 1);
    }
    
    return query;
  }

  async findById(id: string, options: RepositoryOptions = {}): Promise<T> {
    return this.executeQuery(() => 
      this.createQuery(options).eq('id', id).single()
    );
  }

  async findAll(options: RepositoryOptions = {}): Promise<T[]> {
    return this.executeQuery(() => this.createQuery(options));
  }

  async create(data: Partial<T>): Promise<T> {
    return this.executeQuery(() => 
      supabase.from(this.tableName).insert(data).select().single()
    );
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.executeQuery(() => 
      supabase.from(this.tableName)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
    );
  }

  async delete(id: string): Promise<void> {
    await this.executeQuery(() => 
      supabase.from(this.tableName).delete().eq('id', id)
    );
  }
}
