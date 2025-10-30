
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, ChevronDown, Globe, GraduationCap, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  LANGUAGE_CONFIG, 
  getLanguageDisplayName, 
  getLanguagesByEducationalGroups, 
  getRecommendedLanguages,
  isLanguageRecommendedForState,
  sortLanguagesByRelevance,
  type SupportedLocale 
} from '@/lib/i18n';

interface EnhancedLanguageSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showEducationalContext?: boolean;
  showNativeNames?: boolean;
  allowedLanguages?: SupportedLocale[];
  userState?: string; // For regional recommendations
  showRecommendations?: boolean;
}

export const EnhancedLanguageSelect: React.FC<EnhancedLanguageSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select a language",
  disabled = false,
  className,
  showEducationalContext = true,
  showNativeNames = true,
  allowedLanguages,
  userState,
  showRecommendations = true,
}) => {
  const [open, setOpen] = useState(false);
  
  const languageGroups = getLanguagesByEducationalGroups();
  
  // Filter allowed languages if specified
  const filteredGroups = allowedLanguages 
    ? languageGroups.map(group => ({
        ...group,
        languages: group.languages.filter(lang => allowedLanguages.includes(lang.code))
      })).filter(group => group.languages.length > 0)
    : languageGroups;

  const selectedLanguage = value ? LANGUAGE_CONFIG[value as SupportedLocale] : null;
  const recommendedLanguages = userState ? getRecommendedLanguages(userState) : [];

  const renderLanguageItem = (language: any, isRecommended: boolean) => (
    <CommandItem
      key={language.code}
      value={`${language.code} ${language.native} ${language.english}`}
      onSelect={() => {
        onValueChange(language.code);
        setOpen(false);
      }}
      className={cn(
        "flex items-center justify-between w-full",
        isRecommended && "bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500"
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {showNativeNames ? language.native : language.english}
            </span>
            {isRecommended && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <MapPin className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
            )}
          </div>
          {showNativeNames && language.native !== language.english && (
            <span className="text-xs text-muted-foreground">
              {language.english}
            </span>
          )}
          {showEducationalContext && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              {language.educationalContext}
            </span>
          )}
        </div>
      </div>
      <Check
        className={cn(
          "ml-auto h-4 w-4",
          value === language.code ? "opacity-100" : "opacity-0"
        )}
      />
    </CommandItem>
  );

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled}
                className={cn("w-full justify-between", className)}
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  {selectedLanguage ? (
                    <div className="flex items-center gap-2">
                      {getLanguageDisplayName(value as SupportedLocale, showNativeNames, true)}
                      {showRecommendations && userState && isLanguageRecommendedForState(value as SupportedLocale, userState) && (
                        <Badge variant="secondary" className="text-xs">
                          <MapPin className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                  ) : (
                    placeholder
                  )}
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Languages taught in Indian schools</p>
            </TooltipContent>
          </Tooltip>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" side="bottom" align="start">
          <Command>
            <CommandInput placeholder="Search languages..." />
            <CommandList>
              <CommandEmpty>No language found.</CommandEmpty>
              
              {/* Show recommended languages first if user state is provided */}
              {showRecommendations && userState && recommendedLanguages.length > 0 && (
                <CommandGroup heading={`Recommended for ${userState}`}>
                  {recommendedLanguages
                    .filter(code => !allowedLanguages || allowedLanguages.includes(code))
                    .map(code => {
                      const language = { code, ...LANGUAGE_CONFIG[code] };
                      return renderLanguageItem(language, true);
                    })}
                </CommandGroup>
              )}

              {/* Show all languages grouped by educational context */}
              {filteredGroups.map((group) => (
                <CommandGroup 
                  key={group.group} 
                  heading={
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3 h-3" />
                      <span>{group.group}</span>
                    </div>
                  }
                >
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    {group.description}
                  </div>
                  {group.languages.map((language) => {
                    const isRecommended = showRecommendations && userState && 
                      isLanguageRecommendedForState(language.code, userState);
                    return renderLanguageItem(language, isRecommended);
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};
