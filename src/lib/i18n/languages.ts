
// Supported languages based on Indian education system
export const SUPPORTED_LOCALES = [
  'en', 'hi', 'sa', 'bn', 'te', 'mr', 'ta', 'gu', 'ur', 'kn', 'ml', 'or', 'pa', 'as', 'kok', 'ne'
] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Default locale
export const DEFAULT_LOCALE = 'en';

// Language metadata with educational context
export const LANGUAGE_CONFIG = {
  // Primary Educational Languages
  en: { 
    native: 'English', 
    english: 'English', 
    script: 'ltr', 
    region: 'Pan-India',
    educationalContext: 'Medium of instruction in schools across India',
    prevalence: 'primary'
  },
  hi: { 
    native: 'हिन्दी', 
    english: 'Hindi', 
    script: 'ltr', 
    region: 'North & Central India',
    educationalContext: 'National language, taught as first/second language',
    prevalence: 'primary'
  },
  sa: { 
    native: 'संस्कृतम्', 
    english: 'Sanskrit', 
    script: 'ltr', 
    region: 'Classical',
    educationalContext: 'Classical language, third language option in schools',
    prevalence: 'classical'
  },

  // Major State Languages (Active in State Education Systems)
  bn: { 
    native: 'বাংলা', 
    english: 'Bengali', 
    script: 'ltr', 
    region: 'East India',
    educationalContext: 'Medium of instruction in West Bengal, Tripura',
    prevalence: 'state'
  },
  te: { 
    native: 'తెలుగు', 
    english: 'Telugu', 
    script: 'ltr', 
    region: 'South India',
    educationalContext: 'Medium of instruction in Andhra Pradesh, Telangana',
    prevalence: 'state'
  },
  mr: { 
    native: 'मराठी', 
    english: 'Marathi', 
    script: 'ltr', 
    region: 'West India',
    educationalContext: 'Medium of instruction in Maharashtra',
    prevalence: 'state'
  },
  ta: { 
    native: 'தமிழ்', 
    english: 'Tamil', 
    script: 'ltr', 
    region: 'South India',
    educationalContext: 'Medium of instruction in Tamil Nadu',
    prevalence: 'state'
  },
  gu: { 
    native: 'ગુજરાતી', 
    english: 'Gujarati', 
    script: 'ltr', 
    region: 'West India',
    educationalContext: 'Medium of instruction in Gujarat',
    prevalence: 'state'
  },
  ur: { 
    native: 'اردو', 
    english: 'Urdu', 
    script: 'rtl', 
    region: 'Pan-India',
    educationalContext: 'Widely taught as optional second/third language',
    prevalence: 'optional'
  },
  kn: { 
    native: 'ಕನ್ನಡ', 
    english: 'Kannada', 
    script: 'ltr', 
    region: 'South India',
    educationalContext: 'Medium of instruction in Karnataka',
    prevalence: 'state'
  },
  ml: { 
    native: 'മലയാളം', 
    english: 'Malayalam', 
    script: 'ltr', 
    region: 'South India',
    educationalContext: 'Medium of instruction in Kerala',
    prevalence: 'state'
  },
  or: { 
    native: 'ଓଡ଼ିଆ', 
    english: 'Odia', 
    script: 'ltr', 
    region: 'East India',
    educationalContext: 'Medium of instruction in Odisha',
    prevalence: 'state'
  },
  pa: { 
    native: 'ਪੰਜਾਬੀ', 
    english: 'Punjabi', 
    script: 'ltr', 
    region: 'North India',
    educationalContext: 'Medium of instruction in Punjab',
    prevalence: 'state'
  },

  // Regional Languages with Educational Infrastructure
  as: { 
    native: 'অসমীয়া', 
    english: 'Assamese', 
    script: 'ltr', 
    region: 'Northeast India',
    educationalContext: 'Medium of instruction in Assam',
    prevalence: 'regional'
  },
  kok: { 
    native: 'कोंकणी', 
    english: 'Konkani', 
    script: 'ltr', 
    region: 'West India',
    educationalContext: 'Official language of Goa, taught in select schools',
    prevalence: 'regional'
  },
  ne: { 
    native: 'नेपाली', 
    english: 'Nepali', 
    script: 'ltr', 
    region: 'North India',
    educationalContext: 'Official in Sikkim, taught in West Bengal hills',
    prevalence: 'regional'
  },
} as const;

// Group languages by educational prevalence and region
export const EDUCATIONAL_LANGUAGE_GROUPS = {
  'Primary Languages': {
    description: 'Core languages in Indian education system',
    languages: ['en', 'hi', 'sa'] as SupportedLocale[]
  },
  'Major State Languages': {
    description: 'Primary medium of instruction in respective states',
    languages: ['bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa'] as SupportedLocale[]
  },
  'Optional & Regional': {
    description: 'Widely taught optional languages and regional languages',
    languages: ['ur', 'as', 'kok', 'ne'] as SupportedLocale[]
  }
} as const;

// Regional mapping for language recommendations
export const STATE_LANGUAGE_MAPPING = {
  // North India
  'Delhi': ['hi', 'en', 'ur', 'pa'],
  'Punjab': ['pa', 'hi', 'en'],
  'Haryana': ['hi', 'en', 'pa'],
  'Uttar Pradesh': ['hi', 'en', 'ur'],
  'Uttarakhand': ['hi', 'en'],
  'Himachal Pradesh': ['hi', 'en'],
  'Jammu and Kashmir': ['ur', 'hi', 'en'],
  'Ladakh': ['ur', 'hi', 'en'],

  // West India
  'Maharashtra': ['mr', 'hi', 'en'],
  'Gujarat': ['gu', 'hi', 'en'],
  'Goa': ['kok', 'mr', 'hi', 'en'],
  'Rajasthan': ['hi', 'en'],

  // South India
  'Tamil Nadu': ['ta', 'en'],
  'Karnataka': ['kn', 'en', 'hi'],
  'Kerala': ['ml', 'en', 'hi'],
  'Andhra Pradesh': ['te', 'en', 'hi'],
  'Telangana': ['te', 'en', 'hi'],

  // East India
  'West Bengal': ['bn', 'hi', 'en', 'ne'],
  'Odisha': ['or', 'hi', 'en'],
  'Jharkhand': ['hi', 'en'],
  'Bihar': ['hi', 'en'],

  // Northeast India
  'Assam': ['as', 'bn', 'hi', 'en'],
  'Tripura': ['bn', 'hi', 'en'],
  'Meghalaya': ['en', 'hi'],
  'Manipur': ['en', 'hi'],
  'Mizoram': ['en', 'hi'],
  'Nagaland': ['en', 'hi'],
  'Arunachal Pradesh': ['en', 'hi'],
  'Sikkim': ['ne', 'hi', 'en'],

  // Central India
  'Madhya Pradesh': ['hi', 'en'],
  'Chhattisgarh': ['hi', 'en'],
} as const;
