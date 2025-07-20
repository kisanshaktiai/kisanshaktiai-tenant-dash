
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, RefreshCw } from 'lucide-react';
import { useSlugValidation } from '@/hooks/useSlugValidation';
import { cn } from '@/lib/utils';

interface SlugInputProps {
  value: string;
  onChange: (value: string) => void;
  organizationName: string;
  error?: string;
  disabled?: boolean;
}

export const SlugInput: React.FC<SlugInputProps> = ({
  value,
  onChange,
  organizationName,
  error,
  disabled = false
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const {
    validationResult,
    suggestions,
    isValidating,
    isLoadingSuggestions,
    validateSlug,
    generateSuggestions,
    clearValidation,
    clearSuggestions
  } = useSlugValidation();

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Validate slug when local value changes
  useEffect(() => {
    if (localValue && localValue !== value) {
      validateSlug(localValue);
    }
  }, [localValue, validateSlug, value]);

  // Generate suggestions when organization name changes
  useEffect(() => {
    if (organizationName && organizationName.trim() !== '') {
      generateSuggestions(organizationName);
    } else {
      clearSuggestions();
    }
  }, [organizationName, generateSuggestions, clearSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocalValue(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
    validateSlug(suggestion);
  };

  const handleGenerateSuggestions = () => {
    if (organizationName) {
      generateSuggestions(organizationName);
      setShowSuggestions(true);
    }
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    
    if (validationResult) {
      if (validationResult.available) {
        return <Check className="h-4 w-4 text-green-500" />;
      } else {
        return <X className="h-4 w-4 text-destructive" />;
      }
    }
    
    return null;
  };

  const getValidationMessage = () => {
    if (error) return error;
    if (validationResult && !validationResult.available) {
      return validationResult.error;
    }
    if (validationResult && validationResult.available) {
      return validationResult.message || 'Slug is available';
    }
    return null;
  };

  const validationMessage = getValidationMessage();
  const hasError = error || (validationResult && !validationResult.available);

  return (
    <div className="space-y-2">
      <Label htmlFor="slug">Organization Slug</Label>
      <div className="relative">
        <div className="flex">
          <span className="inline-flex items-center px-3 text-sm bg-muted border border-r-0 border-input rounded-l-md">
            https://
          </span>
          <Input
            id="slug"
            type="text"
            value={localValue}
            onChange={handleInputChange}
            disabled={disabled}
            className={cn(
              "rounded-l-none",
              hasError && "border-destructive focus-visible:ring-destructive"
            )}
            placeholder="your-organization"
          />
          <span className="inline-flex items-center px-3 text-sm bg-muted border border-l-0 border-input rounded-r-md">
            .kisanshakti.ai
          </span>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pr-16">
          {getValidationIcon()}
        </div>
      </div>
      
      {validationMessage && (
        <p className={cn(
          "text-sm",
          hasError ? "text-destructive" : "text-green-600"
        )}>
          {validationMessage}
        </p>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Need help?</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleGenerateSuggestions}
          disabled={!organizationName || isLoadingSuggestions}
          className="h-auto p-0 text-primary hover:text-primary/80"
        >
          {isLoadingSuggestions ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          Generate suggestions
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-3 p-3 border rounded-md bg-muted/50">
          <h4 className="text-sm font-medium mb-2">Suggested slugs:</h4>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion.slug)}
                disabled={!suggestion.available}
                className={cn(
                  "justify-start",
                  suggestion.available 
                    ? "text-green-700 border-green-200 bg-green-50 hover:bg-green-100" 
                    : "text-muted-foreground opacity-50"
                )}
              >
                <span className="truncate">{suggestion.slug}</span>
                {suggestion.available && <Check className="h-3 w-3 ml-1 text-green-500" />}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowSuggestions(false)}
            className="mt-2 text-xs"
          >
            Hide suggestions
          </Button>
        </div>
      )}
    </div>
  );
};
