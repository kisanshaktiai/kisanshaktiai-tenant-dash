
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash';

interface SlugValidationResult {
  available: boolean;
  error?: string;
  code?: string;
  message?: string;
}

interface SlugSuggestion {
  slug: string;
  available: boolean;
  error?: string;
}

interface SlugSuggestionsResult {
  suggestions: SlugSuggestion[];
}

export const useSlugValidation = () => {
  const [validationResult, setValidationResult] = useState<SlugValidationResult | null>(null);
  const [suggestions, setSuggestions] = useState<SlugSuggestion[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const validateSlug = useCallback(
    debounce(async (slug: string) => {
      if (!slug || slug.trim() === '') {
        setValidationResult(null);
        return;
      }

      setIsValidating(true);
      try {
        const { data, error } = await supabase.rpc('check_slug_availability', {
          p_slug: slug.trim().toLowerCase()
        });

        if (error) {
          console.error('Error validating slug:', error);
          setValidationResult({
            available: false,
            error: 'Unable to validate slug. Please try again.',
            code: 'VALIDATION_ERROR'
          });
        } else {
          // Safe type conversion through unknown
          setValidationResult(data as unknown as SlugValidationResult);
        }
      } catch (error) {
        console.error('Error validating slug:', error);
        setValidationResult({
          available: false,
          error: 'Unable to validate slug. Please try again.',
          code: 'VALIDATION_ERROR'
        });
      } finally {
        setIsValidating(false);
      }
    }, 500),
    []
  );

  const generateSuggestions = useCallback(async (organizationName: string) => {
    if (!organizationName || organizationName.trim() === '') {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.rpc('generate_slug_suggestions', {
        p_organization_name: organizationName.trim()
      });

      if (error) {
        console.error('Error generating suggestions:', error);
        setSuggestions([]);
      } else {
        // Safe type conversion through unknown
        const result = data as unknown as SlugSuggestionsResult;
        setSuggestions(result.suggestions || []);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  return {
    validationResult,
    suggestions,
    isValidating,
    isLoadingSuggestions,
    validateSlug,
    generateSuggestions,
    clearValidation: () => setValidationResult(null),
    clearSuggestions: () => setSuggestions([])
  };
};
