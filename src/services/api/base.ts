
import { supabase } from '@/integrations/supabase/client';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export class ApiService {
  protected handleError(error: any): ApiError {
    return {
      message: error.message || 'An unexpected error occurred',
      code: error.code,
      details: error.details
    };
  }

  protected async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    const { data, error } = await queryFn();
    
    if (error) {
      throw this.handleError(error);
    }
    
    return data as T;
  }
}
