
import { SupportedLocale } from './languages';

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

  // Farmer Form - Updated for educational context
  'farmer.languagePreference': 'Language Preference',
  'farmer.languagePreferenceDesc': 'Select preferred language for mobile app (based on regional education)',
  'farmer.searchLanguages': 'Search languages...',
  'farmer.selectLanguage': 'Select a language',
  'farmer.languageRecommendation': 'Recommended for your region',

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

// Message definitions with focused translations for educational languages
export const messages = {
  en: {
    ...baseMessages,
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
    'farmer.languagePreferenceDesc': 'मोबाइल ऐप के लिए पसंदीदा भाषा चुनें (क्षेत्रीय शिक्षा के आधार पर)',
    'farmer.searchLanguages': 'भाषाएं खोजें...',
    'farmer.selectLanguage': 'भाषा चुनें',
    'farmer.languageRecommendation': 'आपके क्षेत्र के लिए अनुशंसित',
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
    'farmer.languagePreferenceDesc': 'మొబైల్ యాప్ కోసం ఇష్టపడే భాషను ఎంచుకోండి (ప్రాంతీయ విద్య ఆధారంగా)',
    'farmer.searchLanguages': 'భాషలను వెతకండి...',
    'farmer.selectLanguage': 'భాషను ఎంచుకోండి',
    'farmer.languageRecommendation': 'మీ ప్రాంతానికి సిఫార్సు చేయబడింది',
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
    'farmer.languagePreferenceDesc': 'மொபைல் பயன்பாட்டிற்கான விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும் (பிராந்திய கல்வியின் அடிப்படையில்)',
    'farmer.searchLanguages': 'மொழிகளைத் தேடு...',
    'farmer.selectLanguage': 'மொழியைத் தேர்ந்தெடுக்கவும்',
    'farmer.languageRecommendation': 'உங்கள் பிராந்தியத்திற்கு பரிந்துரைக்கப்பட்டது',
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
    'farmer.languagePreferenceDesc': 'ಮೊಬೈಲ್ ಆಪ್‌ಗಾಗಿ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ (ಪ್ರಾದೇಶಿಕ ಶಿಕ್ಷಣದ ಆಧಾರದ ಮೇಲೆ)',
    'farmer.searchLanguages': 'ಭಾಷೆಗಳನ್ನು ಹುಡುಕಿ...',
    'farmer.selectLanguage': 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'farmer.languageRecommendation': 'ನಿಮ್ಮ ಪ್ರದೇಶಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ',
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
    'farmer.languagePreferenceDesc': 'മൊബൈൽ ആപ്പിനുള്ള മുൻഗണനാ ഭാഷ തിരഞ്ഞെടുക്കുക (പ്രാദേശിക വിദ്യാഭ്യാസത്തെ അടിസ്ഥാനമാക്കി)',
    'farmer.searchLanguages': 'ഭാഷകൾ തിരയുക...',
    'farmer.selectLanguage': 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    'farmer.languageRecommendation': 'നിങ്ങളുടെ പ്രദേശത്തിന് ശുപാർശ ചെയ്യുന്നത്',
    'common.continue': 'തുടരുക',
    'common.save': 'സേവ് ചെയ്യുക',
  },
  // Add base messages for remaining languages
  sa: baseMessages,
  bn: baseMessages,
  mr: baseMessages,
  gu: baseMessages,
  ur: baseMessages,
  or: baseMessages,
  pa: baseMessages,
  as: baseMessages,
  kok: baseMessages,
  ne: baseMessages,
};
