
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LANGUAGE_CONFIG, getLanguageDisplayName, getLanguagesByRegion, type SupportedLocale } from '@/lib/i18n';

interface LanguageSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showRegionGroups?: boolean;
  showNativeNames?: boolean;
  allowedLanguages?: SupportedLocale[];
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select a language",
  disabled = false,
  className,
  showRegionGroups = true,
  showNativeNames = true,
  allowedLanguages,
}) => {
  const [open, setOpen] = useState(false);
  
  const languageGroups = getLanguagesByRegion();
  
  // Filter allowed languages if specified
  const filteredGroups = allowedLanguages 
    ? languageGroups.map(group => ({
        ...group,
        languages: group.languages.filter(lang => allowedLanguages.includes(lang.code))
      })).filter(group => group.languages.length > 0)
    : languageGroups;

  const selectedLanguage = value ? LANGUAGE_CONFIG[value as SupportedLocale] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            {selectedLanguage ? 
              getLanguageDisplayName(value as SupportedLocale, showNativeNames, true) : 
              placeholder
            }
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" side="bottom" align="start">
        <Command>
          <CommandInput placeholder="Search languages..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            {showRegionGroups ? (
              filteredGroups.map((group) => (
                <CommandGroup key={group.region} heading={group.region}>
                  {group.languages.map((language) => (
                    <CommandItem
                      key={language.code}
                      value={`${language.code} ${language.native} ${language.english}`}
                      onSelect={() => {
                        onValueChange(language.code);
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {showNativeNames ? language.native : language.english}
                            </span>
                            {showNativeNames && language.native !== language.english && (
                              <span className="text-xs text-muted-foreground">
                                {language.english}
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
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            ) : (
              <CommandGroup>
                {filteredGroups.flatMap(group => group.languages).map((language) => (
                  <CommandItem
                    key={language.code}
                    value={`${language.code} ${language.native} ${language.english}`}
                    onSelect={() => {
                      onValueChange(language.code);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {showNativeNames ? language.native : language.english}
                          </span>
                          {showNativeNames && language.native !== language.english && (
                            <span className="text-xs text-muted-foreground">
                              {language.english}
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
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
