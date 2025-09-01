import { createIntl, createIntlCache } from 'react-intl';

// Create intl cache for performance
const cache = createIntlCache();

// Default locale
export const DEFAULT_LOCALE = 'en';

// Comprehensive list of supported Indian languages with ISO 639-1 codes
export const SUPPORTED_LOCALES = [
  'en', 'hi', 'te', 'ta', 'kn', 'ml', 'gu', 'mr', 'pa', 'bn', 'or', 'as', 'ur', 'kok', 'ne', 'mni', 'sd', 'sa', 'ks', 'brx', 'doi', 'mai', 'sat'
] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Language metadata with native names and English translations
export const LANGUAGE_CONFIG = {
  en: { native: 'English', english: 'English', script: 'ltr', region: 'International' },
  hi: { native: 'हिन्दी', english: 'Hindi', script: 'ltr', region: 'North India' },
  te: { native: 'తెలుగు', english: 'Telugu', script: 'ltr', region: 'South India' },
  ta: { native: 'தமிழ்', english: 'Tamil', script: 'ltr', region: 'South India' },
  kn: { native: 'ಕನ್ನಡ', english: 'Kannada', script: 'ltr', region: 'South India' },
  ml: { native: 'മലയാളം', english: 'Malayalam', script: 'ltr', region: 'South India' },
  gu: { native: 'ગુજરાતી', english: 'Gujarati', script: 'ltr', region: 'West India' },
  mr: { native: 'मराठी', english: 'Marathi', script: 'ltr', region: 'West India' },
  pa: { native: 'ਪੰਜਾਬੀ', english: 'Punjabi', script: 'ltr', region: 'North India' },
  bn: { native: 'বাংলা', english: 'Bengali', script: 'ltr', region: 'East India' },
  or: { native: 'ଓଡ଼ିଆ', english: 'Odia', script: 'ltr', region: 'East India' },
  as: { native: 'অসমীয়া', english: 'Assamese', script: 'ltr', region: 'Northeast India' },
  ur: { native: 'اردو', english: 'Urdu', script: 'rtl', region: 'North India' },
  kok: { native: 'कोंकणी', english: 'Konkani', script: 'ltr', region: 'West India' },
  ne: { native: 'नेपाली', english: 'Nepali', script: 'ltr', region: 'North India' },
  mni: { native: 'মৈতৈলোন্', english: 'Manipuri', script: 'ltr', region: 'Northeast India' },
  sd: { native: 'سنڌي', english: 'Sindhi', script: 'rtl', region: 'West India' },
  sa: { native: 'संस्कृतम्', english: 'Sanskrit', script: 'ltr', region: 'Classical' },
  ks: { native: 'کٲشُر', english: 'Kashmiri', script: 'rtl', region: 'North India' },
  brx: { native: 'बर\'', english: 'Bodo', script: 'ltr', region: 'Northeast India' },
  doi: { native: 'डोगरी', english: 'Dogri', script: 'ltr', region: 'North India' },
  mai: { native: 'मैथिली', english: 'Maithili', script: 'ltr', region: 'East India' },
  sat: { native: 'ᱥᱟᱱᱛᱟᱲᱤ', english: 'Santali', script: 'ltr', region: 'East India' },
} as const;

// Group languages by region for better UX
export const LANGUAGE_GROUPS = {
  'International': ['en'],
  'North India': ['hi', 'pa', 'ur', 'ne', 'doi', 'ks'],
  'South India': ['te', 'ta', 'kn', 'ml'],
  'West India': ['gu', 'mr', 'kok', 'sd'],
  'East India': ['bn', 'or', 'mai', 'sat'],
  'Northeast India': ['as', 'mni', 'brx'],
  'Classical': ['sa'],
} as const;

// Base messages that will be shared across languages
const baseMessages = {
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.analytics': 'Analytics',
  'nav.notifications': 'Notifications',
  'nav.farmers': 'Farmers',
  'nav.dealers': 'Dealers',
  'nav.landManagement': 'Land Management',
  'nav.cropMonitoring': 'Crop Monitoring',
  'nav.productCatalog': 'Product Catalog',
  'nav.campaigns': 'Campaigns',
  'nav.performance': 'Performance',
  'nav.reports': 'Reports',
  'nav.messages': 'Messages',
  'nav.communityForum': 'Community Forum',
  'nav.settings': 'Settings',
  'nav.helpSupport': 'Help & Support',

  // Dashboard
  'dashboard.title': 'AgriTenant Hub',
  'dashboard.subtitle': 'Dashboard',
  'dashboard.welcome': 'Welcome to AgriTenant Hub!',
  'dashboard.setupMessage': "Let's get your organization set up in just a few steps",

  // Product Catalog
  'products.title': 'Product Catalog',
  'products.subtitle': 'Manage your agricultural products and services catalog',
  'products.addProduct': 'Add Product',
  'products.bulkImport': 'Bulk Import',
  'products.products': 'Products',
  'products.categories': 'Categories',
  'products.pricing': 'Pricing',
  'products.analytics': 'Analytics',
  'products.importExport': 'Import/Export',
  'products.createNew': 'Create New Product',
  'products.edit': 'Edit Product',
  'products.addNewDescription': 'Add a new product to your catalog',
  'products.updateDescription': 'Update product information',

  // Farmer Form
  'farmer.languagePreference': 'Language Preference',
  'farmer.languagePreferenceDesc': 'Select preferred language for mobile app',
  'farmer.searchLanguages': 'Search languages...',
  'farmer.selectLanguage': 'Select a language',

  // Common Actions
  'common.continue': 'Continue',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.create': 'Create',
  'common.loading': 'Loading...',
  'common.success': 'Success',
  'common.error': 'Error',
  'common.retry': 'Retry',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.export': 'Export',
  'common.import': 'Import',

  // Error Messages
  'error.generic': 'An unexpected error occurred. Please try again.',
  'error.network': 'Network error. Please check your connection.',
  'error.unauthorized': 'You are not authorized to perform this action.',
  'error.notFound': 'The requested resource was not found.',
  'error.validation': 'Please check your input and try again.',

  // Success Messages
  'success.saved': 'Successfully saved!',
  'success.created': 'Successfully created!',
  'success.updated': 'Successfully updated!',
  'success.deleted': 'Successfully deleted!',
};

// Message definitions - starting with detailed English and basic translations for others
export const messages = {
  en: {
    ...baseMessages,
    // Additional English-specific messages
    // Navigation additions
    'nav.dashboard': 'Dashboard',
    'nav.analytics': 'Analytics',
    'nav.notifications': 'Notifications',
    'nav.farmers': 'Farmers',
    'nav.dealers': 'Dealers',
    'nav.landManagement': 'Land Management',
    'nav.cropMonitoring': 'Crop Monitoring',
    'nav.productCatalog': 'Product Catalog',
    'nav.campaigns': 'Campaigns',
    'nav.performance': 'Performance',
    'nav.reports': 'Reports',
    'nav.messages': 'Messages',
    'nav.communityForum': 'Community Forum',
    'nav.settings': 'Settings',
    'nav.helpSupport': 'Help & Support',

    // Dashboard
    'dashboard.title': 'AgriTenant Hub',
    'dashboard.subtitle': 'Dashboard',
    'dashboard.welcome': 'Welcome to AgriTenant Hub!',
    'dashboard.setupMessage': "Let's get your organization set up in just a few steps",

    // Product Catalog
    'products.title': 'Product Catalog',
    'products.subtitle': 'Manage your agricultural products and services catalog',
    'products.addProduct': 'Add Product',
    'products.bulkImport': 'Bulk Import',
    'products.products': 'Products',
    'products.categories': 'Categories',
    'products.pricing': 'Pricing',
    'products.analytics': 'Analytics',
    'products.importExport': 'Import/Export',
    'products.createNew': 'Create New Product',
    'products.edit': 'Edit Product',
    'products.addNewDescription': 'Add a new product to your catalog',
    'products.updateDescription': 'Update product information',

    // Farmer Form
    'farmer.languagePreference': 'Language Preference',
    'farmer.languagePreferenceDesc': 'Select preferred language for mobile app',
    'farmer.searchLanguages': 'Search languages...',
    'farmer.selectLanguage': 'Select a language',

    // Common Actions
    'common.continue': 'Continue',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.create': 'Create',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',

    // Error Messages
    'error.generic': 'An unexpected error occurred. Please try again.',
    'error.network': 'Network error. Please check your connection.',
    'error.unauthorized': 'You are not authorized to perform this action.',
    'error.notFound': 'The requested resource was not found.',
    'error.validation': 'Please check your input and try again.',

    // Success Messages
    'success.saved': 'Successfully saved!',
    'success.created': 'Successfully created!',
    'success.updated': 'Successfully updated!',
    'success.deleted': 'Successfully deleted!',
  },
  hi: {
    ...baseMessages,
    // Hindi translations
    'nav.dashboard': 'डैशबोर्ड',
    'nav.analytics': 'विश्लेषण',
    'nav.farmers': 'किसान',
    'nav.dealers': 'डीलर',
    'nav.productCatalog': 'उत्पाद सूची',
    'nav.campaigns': 'अभियान',
    'nav.settings': 'सेटिंग्स',
    'products.title': 'उत्पाद सूची',
    'products.addProduct': 'उत्पाद जोड़ें',
    'farmer.languagePreference': 'भाषा प्राथमिकता',
    'farmer.languagePreferenceDesc': 'मोबाइल ऐप के लिए पसंदीदा भाषा चुनें',
    'farmer.searchLanguages': 'भाषाएं खोजें...',
    'farmer.selectLanguage': 'भाषा चुनें',
    'common.continue': 'जारी रखें',
    'common.save': 'सहेजें',
    'common.loading': 'लोड हो रहा है...',
  },
  te: {
    ...baseMessages,
    // Telugu translations
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.farmers': 'రైతులు',
    'nav.dealers': 'డీలర్లు',
    'products.title': 'ఉత్పత్తుల జాబితా',
    'farmer.languagePreference': 'భాష ప్రాధాన్యత',
    'farmer.languagePreferenceDesc': 'మొబైల్ యాప్ కోసం ఇష్టపడే భాషను ఎంచుకోండి',
    'farmer.searchLanguages': 'భాషలను వెతకండి...',
    'farmer.selectLanguage': 'భాషను ఎంచుకోండి',
    'common.continue': 'కొనసాగించు',
    'common.save': 'సేవ్ చేయి',
  },
  ta: {
    ...baseMessages,
    // Tamil translations
    'nav.dashboard': 'கட்டுப்பாட்டு பலகை',
    'nav.farmers': 'விவசாயிகள்',
    'products.title': 'தயாரிப்பு பட்டியல்',
    'farmer.languagePreference': 'மொழி விருப்பம்',
    'farmer.languagePreferenceDesc': 'மொபைல் பயன்பாட்டிற்கான விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
    'farmer.searchLanguages': 'மொழிகளைத் தேடு...',
    'farmer.selectLanguage': 'மொழியைத் தேர்ந்தெடுக்கவும்',
    'common.continue': 'தொடரவும்',
    'common.save': 'சேமி',
  },
  kn: {
    ...baseMessages,
    // Kannada translations
    'nav.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'nav.farmers': 'ರೈತರು',
    'products.title': 'ಉತ್ಪನ್ನ ಪಟ್ಟಿ',
    'farmer.languagePreference': 'ಭಾಷಾ ಆದ್ಯತೆ',
    'farmer.languagePreferenceDesc': 'ಮೊಬೈಲ್ ಆಪ್‌ಗಾಗಿ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'farmer.searchLanguages': 'ಭಾಷೆಗಳನ್ನು ಹುಡುಕಿ...',
    'farmer.selectLanguage': 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'common.continue': 'ಮುಂದುವರಿಸಿ',
    'common.save': 'ಉಳಿಸಿ',
  },
  ml: {
    ...baseMessages,
    // Malayalam translations
    'nav.dashboard': 'ഡാഷ്ബോർഡ്',
    'nav.farmers': 'കർഷകർ',
    'products.title': 'ഉൽപ്പന്ന പട്ടിക',
    'farmer.languagePreference': 'ഭാഷാ മുൻഗണന',
    'farmer.languagePreferenceDesc': 'മൊബൈൽ ആപ്പിനുള്ള മുൻഗണനാ ഭാഷ തിരഞ്ഞെടുക്കുക',
    'farmer.searchLanguages': 'ഭാഷകൾ തിരയുക...',
    'farmer.selectLanguage': 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    'common.continue': 'തുടരുക',
    'common.save': 'സേവ് ചെയ്യുക',
  },
  // Add base messages for all other languages to prevent TypeScript errors
  gu: baseMessages,
  mr: baseMessages,
  pa: baseMessages,
  bn: baseMessages,
  or: baseMessages,
  as: baseMessages,
  ur: baseMessages,
  kok: baseMessages,
  ne: baseMessages,
  mni: baseMessages,
  sd: baseMessages,
  sa: baseMessages,
  ks: baseMessages,
  brx: baseMessages,
  doi: baseMessages,
  mai: baseMessages,
  sat: baseMessages,
};

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

// Get language display name
export const getLanguageDisplayName = (locale: SupportedLocale, showNative = true, showEnglish = true): string => {
  const config = LANGUAGE_CONFIG[locale];
  if (!config) return locale;
  
  if (showNative && showEnglish && config.native !== config.english) {
    return `${config.native} (${config.english})`;
  } else if (showNative) {
    return config.native;
  } else {
    return config.english;
  }
};

// Get languages by region
export const getLanguagesByRegion = () => {
  return Object.entries(LANGUAGE_GROUPS).map(([region, codes]) => ({
    region,
    languages: codes.map(code => ({
      code: code as SupportedLocale,
      ...LANGUAGE_CONFIG[code as SupportedLocale]
    }))
  }));
};
