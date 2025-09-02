
import { createIntl, createIntlCache } from 'react-intl';
import { SupportedLocale, DEFAULT_LOCALE, LANGUAGE_CONFIG, EDUCATIONAL_LANGUAGE_GROUPS, STATE_LANGUAGE_MAPPING } from './languages';
import { messages } from './messages';

// Create intl cache for performance
const cache = createIntlCache();

// Create intl instance
export const createIntlInstance = (locale: SupportedLocale = DEFAULT_LOCALE) => {
  return createIntl({
    locale,
    messages: messages[locale] || messages[DEFAULT_LOCALE],
  }, cache);
};

// Helper functions
export const formatNumber = (intl: ReturnType<typeof createIntlInstance>, value: number) => {
  return intl.formatNumber(value);
};

export const formatDate = (intl: ReturnType<typeof createIntlInstance>, value: Date | number) => {
  return intl.formatDate(value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatRelativeTime = (intl: ReturnType<typeof createIntlInstance>, value: number, unit: 'second' | 'minute' | 'hour' | 'day') => {
  return intl.formatRelativeTime(value, unit);
};

// Get language display name with educational context
export const getLanguageDisplayName = (locale: SupportedLocale, showNative = true, showEnglish = true, showContext = false): string => {
  const config = LANGUAGE_CONFIG[locale];
  if (!config) return locale;
  
  let displayName = '';
  
  if (showNative && showEnglish && config.native !== config.english) {
    displayName = `${config.native} (${config.english})`;
  } else if (showNative) {
    displayName = config.native;
  } else {
    displayName = config.english;
  }
  
  if (showContext && config.educationalContext) {
    displayName += ` - ${config.educationalContext}`;
  }
  
  return displayName;
};

// Get languages by educational groups
export const getLanguagesByEducationalGroups = () => {
  return Object.entries(EDUCATIONAL_LANGUAGE_GROUPS).map(([groupName, groupData]) => ({
    group: groupName,
    description: groupData.description,
    languages: groupData.languages.map(code => ({
      code,
      ...LANGUAGE_CONFIG[code]
    }))
  }));
};

// Get recommended languages for a state
export const getRecommendedLanguages = (state?: string): SupportedLocale[] => {
  if (!state || !STATE_LANGUAGE_MAPPING[state as keyof typeof STATE_LANGUAGE_MAPPING]) {
    return ['en', 'hi']; // Default fallback
  }
  
  return STATE_LANGUAGE_MAPPING[state as keyof typeof STATE_LANGUAGE_MAPPING] as SupportedLocale[];
};

// Check if language is recommended for region
export const isLanguageRecommendedForState = (language: SupportedLocale, state?: string): boolean => {
  if (!state) return false;
  const recommended = getRecommendedLanguages(state);
  return recommended.includes(language);
};

// Get language prevalence level
export const getLanguagePrevalence = (locale: SupportedLocale): 'primary' | 'state' | 'optional' | 'regional' | 'classical' => {
  return LANGUAGE_CONFIG[locale]?.prevalence || 'regional';
};

// Sort languages by educational relevance
export const sortLanguagesByRelevance = (languages: SupportedLocale[], userState?: string): SupportedLocale[] => {
  const recommended = userState ? getRecommendedLanguages(userState) : [];
  
  return languages.sort((a, b) => {
    // First: Recommended for user's state
    const aRecommended = recommended.includes(a);
    const bRecommended = recommended.includes(b);
    if (aRecommended !== bRecommended) {
      return bRecommended ? 1 : -1;
    }
    
    // Second: By prevalence (primary > state > optional > regional > classical)
    const prevalenceOrder = { primary: 0, state: 1, optional: 2, regional: 3, classical: 4 };
    const aPrevalence = prevalenceOrder[getLanguagePrevalence(a)];
    const bPrevalence = prevalenceOrder[getLanguagePrevalence(b)];
    if (aPrevalence !== bPrevalence) {
      return aPrevalence - bPrevalence;
    }
    
    // Third: Alphabetically by English name
    return LANGUAGE_CONFIG[a].english.localeCompare(LANGUAGE_CONFIG[b].english);
  });
};
