
// This file maintains backward compatibility while using the new modular structure
// All exports are now handled by the new index file
export * from './i18n/index';

// Import for immediate use in existing code
import { 
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LANGUAGE_CONFIG,
  messages,
  createIntlInstance,
  getLanguageDisplayName,
  getLanguagesByEducationalGroups as getLanguagesByRegion
} from './i18n/index';

// Export specific items that might be directly imported
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LANGUAGE_CONFIG,
  messages,
  createIntlInstance,
  getLanguageDisplayName,
  getLanguagesByRegion
};
