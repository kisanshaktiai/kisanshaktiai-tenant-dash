import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

interface SlugValidationResult {
  isValid: boolean;
  error?: string;
  isValidating: boolean;
}

export const useSlugValidation = (currentSlug?: string) => {
  const [validationResult, setValidationResult] = useState<SlugValidationResult>({
    isValid: true,
    isValidating: false,
  });

  const validateSlug = useCallback(
    async (slug: string) => {

      if (!slug || slug === currentSlug) {
        setValidationResult({ isValid: true, isValidating: false });
        return;
      }

      setValidationResult({ isValid: false, isValidating: true });

      try {
        const { data, error } = await supabase.functions.invoke(
          'validate-organization-slug',
          {
            body: { slug, currentSlug },
          }
        );

        if (error) throw error;

        setValidationResult({
          isValid: data.isValid,
          error: data.error,
          isValidating: false,
        });
      } catch (error: any) {
        console.error('Slug validation error:', error);
        setValidationResult({
          isValid: false,
          error: 'Failed to validate slug',
          isValidating: false,
        });
      }
    },
    [currentSlug]
  );

  const debouncedValidate = useDebounce(validateSlug, 500);

  return {
    ...validationResult,
    validateSlug: debouncedValidate,
  };
};
