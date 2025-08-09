
import { createIntl, createIntlCache } from 'react-intl';

// Create intl cache for performance
const cache = createIntlCache();

// Default locale
export const DEFAULT_LOCALE = 'en';

// Supported locales
export const SUPPORTED_LOCALES = ['en', 'hi', 'te', 'ta', 'kn', 'ml'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Message definitions
export const messages = {
  en: {
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

    // Onboarding Steps
    'onboarding.businessVerification': 'Business Verification',
    'onboarding.businessVerificationDesc': 'Verify your business registration details',
    'onboarding.businessInfo': 'Business Information',
    'onboarding.businessInfoDesc': 'Enter your business registration details',
    'onboarding.documentUpload': 'Document Upload',
    'onboarding.documentUploadDesc': 'Upload required business documents',
    'onboarding.gstNumber': 'GST Number',
    'onboarding.panNumber': 'PAN Number',
    'onboarding.businessLicense': 'Business License Number',
    'onboarding.dropFiles': 'Drop files here or click to upload',
    'onboarding.chooseFiles': 'Choose Files',
    'onboarding.acceptedFormats': 'Accepted formats: PDF, JPG, PNG. Max size: 10MB per file.',
    'onboarding.requiredDocs': 'Required: GST Certificate, PAN Card',
    'onboarding.optionalDocs': 'Optional: Business License, Registration Certificate',
    'onboarding.verifyingStep': 'Verifying...',
    'onboarding.verifyContinue': 'Verify & Continue',
    'onboarding.verificationComplete': 'Business Verification Complete',
    'onboarding.verificationSuccess': 'Your business documents have been verified successfully.',

    // Subscription Plans
    'subscription.choosePlan': 'Choose Your Plan',
    'subscription.planDescription': 'Select the plan that best fits your organization\'s needs. You can upgrade anytime.',
    'subscription.planSelected': 'Plan Selected',
    'subscription.selectedPlan': 'You\'ve selected the {planName} plan.',
    'subscription.freeTrialNote': 'All plans include a 14-day free trial. No credit card required.',
    'subscription.continueWithPlan': 'Continue with Plan',
    'subscription.processing': 'Processing...',
    'subscription.mostPopular': 'Most Popular',
    
    // Plan Names and Features
    'subscription.kisanBasic': 'Kisan Basic',
    'subscription.shaktiGrowth': 'Shakti Growth',
    'subscription.aiEnterprise': 'AI Enterprise',
    'subscription.kisanDesc': 'Perfect for small agricultural businesses',
    'subscription.shaktiDesc': 'For growing agricultural organizations',
    'subscription.aiDesc': 'Full-featured solution with AI capabilities',
    'subscription.farmers': '{count, plural, =0 {No farmers} =1 {Up to 1 farmer} other {Up to # farmers}}',
    'subscription.unlimitedFarmers': 'Unlimited farmers',
    'subscription.basicAnalytics': 'Basic analytics',
    'subscription.advancedAnalytics': 'Advanced analytics',
    'subscription.aiInsights': 'AI-powered insights',

    // Branding Configuration
    'branding.title': 'Logo & App Name',
    'branding.titleDesc': 'Upload your organization\'s logo and set the app name',
    'branding.colorScheme': 'Color Scheme',
    'branding.colorSchemeDesc': 'Choose colors that represent your brand',
    'branding.appName': 'App Name',
    'branding.logoUpload': 'Logo Upload',
    'branding.uploadLogo': 'Upload your logo (PNG, JPG, SVG)',
    'branding.recommendedSize': 'Recommended size: 200x200px or larger',
    'branding.primaryColor': 'Primary Color',
    'branding.secondaryColor': 'Secondary Color',
    'branding.preview': 'Preview',
    'branding.saving': 'Saving...',
    'branding.saveContinue': 'Save & Continue',
    'branding.configComplete': 'Branding Configuration Complete',
    'branding.configSuccess': 'Your app branding has been configured successfully.',

    // Feature Selection
    'features.chooseFeatures': 'Choose Your Features',
    'features.featuresDesc': 'Select the features you want to enable. You can modify these later in settings.',
    'features.coreFeatures': 'Core Features',
    'features.communication': 'Communication',
    'features.advancedAnalytics': 'Advanced Analytics',
    'features.technology': 'Technology',
    'features.required': 'Required',
    'features.farmerManagement': 'Farmer Management',
    'features.farmerManagementDesc': 'Manage farmer profiles and data',
    'features.basicAnalytics': 'Basic Analytics',
    'features.basicAnalyticsDesc': 'Essential reporting and insights',
    'features.mobileApp': 'Mobile App Access',
    'features.mobileAppDesc': 'iOS and Android applications',
    'features.smsNotifications': 'SMS Notifications',
    'features.smsNotificationsDesc': 'Send SMS to farmers',
    'features.whatsappIntegration': 'WhatsApp Integration',
    'features.whatsappIntegrationDesc': 'WhatsApp Business API',
    'features.voiceCalls': 'Voice Calling',
    'features.voiceCallsDesc': 'Automated voice messages',
    'features.weatherForecast': 'Weather Forecasting',
    'features.weatherForecastDesc': 'Local weather data and alerts',
    'features.satelliteImagery': 'Satellite Imagery',
    'features.satelliteImageryDesc': 'Crop monitoring via satellite',
    'features.iotIntegration': 'IoT Integration',
    'features.iotIntegrationDesc': 'Connect sensors and devices',
    'features.featuresConfigured': 'Features Configured',
    'features.enabledCount': 'You\'ve enabled {count} {count, plural, =1 {feature} other {features}} for your organization.',

    // Team Invites
    'team.inviteTeam': 'Invite Your Team',
    'team.inviteDesc': 'Add team members to help manage your agricultural operations. This step is optional.',
    'team.addTeamMember': 'Add Team Member',
    'team.addMemberDesc': 'Enter details to invite a new team member',
    'team.fullName': 'Full Name',
    'team.emailAddress': 'Email Address',
    'team.role': 'Role',
    'team.selectRole': 'Select a role',
    'team.admin': 'Admin',
    'team.adminDesc': 'Full access to all features',
    'team.manager': 'Manager',
    'team.managerDesc': 'Manage farmers and campaigns',
    'team.viewer': 'Viewer',
    'team.viewerDesc': 'Read-only access to data',
    'team.teamMembers': 'Team Members ({count})',
    'team.reviewMembers': 'Review team members to be invited',
    'team.noMembers': 'No team members added yet',
    'team.whatHappensNext': 'What happens next?',
    'team.inviteProcess': 'Team members will receive email invitations',
    'team.accountCreation': 'They can create accounts using the invitation link',
    'team.roleManagement': 'You can manage roles and permissions later',
    'team.additionalMembers': 'Additional team members can be added anytime',
    'team.skipForNow': 'Skip for Now',
    'team.sendInvites': 'Send Invites',
    'team.completeSetup': 'Complete Setup',
    'team.teamSetupComplete': 'Team Setup Complete',
    'team.teamLaterMessage': 'You\'ve chosen to set up your team later.',
    'team.invitesSentMessage': '{count} {count, plural, =1 {team invitation has} other {team invitations have}} been prepared.',

    // Data Import
    'dataImport.importData': 'Import Your Data',
    'dataImport.importDesc': 'Import existing farmer and product data, or start fresh. This step is optional.',
    'dataImport.excelImport': 'Excel Import',
    'dataImport.apiIntegration': 'API Integration',
    'dataImport.startFresh': 'Start Fresh',
    'dataImport.excelTitle': 'Excel/CSV Import',
    'dataImport.excelDesc': 'Upload your data using Excel or CSV files',
    'dataImport.farmerData': 'Farmer Data',
    'dataImport.farmerDataDesc': 'Upload farmer information (Excel/CSV)',
    'dataImport.productData': 'Product Data',
    'dataImport.productDataDesc': 'Upload product catalog (Excel/CSV)',
    'dataImport.chooseFile': 'Choose File',
    'dataImport.downloadTemplates': 'Download templates:',
    'dataImport.farmerTemplate': 'Farmer Template',
    'dataImport.productTemplate': 'Product Template',
    'dataImport.apiTitle': 'API Integration',
    'dataImport.apiDesc': 'Connect with your existing systems via API',
    'dataImport.availableIntegrations': 'Available Integrations',
    'dataImport.restApi': 'REST API',
    'dataImport.googleSheets': 'Google Sheets',
    'dataImport.apiNote': 'API integration requires technical setup. Our team will help you configure the connection.',
    'dataImport.startFreshTitle': 'Start Fresh',
    'dataImport.startFreshDesc': 'Begin with a clean slate and add data manually as you go',
    'dataImport.importLater': 'You can always import data later',
    'dataImport.addManually': 'Add farmers one by one through the dashboard',
    'dataImport.bulkImportLater': 'Bulk import via Excel/CSV from settings',
    'dataImport.apiLater': 'Set up API integrations when ready',
    'dataImport.historicalData': 'Import historical data at any time',
    'dataImport.dataImportComplete': 'Data Import Complete',
    'dataImport.skipMessage': 'You\'ve chosen to skip data import for now. You can import data later from settings.',
    'dataImport.methodMessage': 'Data import configured using {method} method.',

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
    'common.continue': 'जारी रखें',
    'common.save': 'सहेजें',
    'common.loading': 'लोड हो रहा है...',
    // ... more Hindi translations
  },
  te: {
    // Telugu translations
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.farmers': 'రైతులు',
    'nav.dealers': 'డీలర్లు',
    'products.title': 'ఉత్పత్తుల జాబితా',
    'common.continue': 'కొనసాగించు',
    'common.save': 'సేవ్ చేయి',
    // ... more Telugu translations
  },
  ta: {
    // Tamil translations
    'nav.dashboard': 'கட்டுப்பாட்டு பலகை',
    'nav.farmers': 'விவசாயிகள்',
    'products.title': 'தயாரிப்பு பட்டியல்',
    'common.continue': 'தொடரவும்',
    'common.save': 'சேமி',
    // ... more Tamil translations
  },
  kn: {
    // Kannada translations
    'nav.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'nav.farmers': 'ರೈತರು',
    'products.title': 'ಉತ್ಪನ್ನ ಪಟ್ಟಿ',
    'common.continue': 'ಮುಂದುವರಿಸಿ',
    'common.save': 'ಉಳಿಸಿ',
    // ... more Kannada translations
  },
  ml: {
    // Malayalam translations
    'nav.dashboard': 'ഡാഷ്ബോർഡ്',
    'nav.farmers': 'കർഷകർ',
    'products.title': 'ഉൽപ്പന്ന പട്ടിക',
    'common.continue': 'തുടരുക',
    'common.save': 'സേവ് ചെയ്യുക',
    // ... more Malayalam translations
  }
};

// Create intl instance
export const createIntlInstance = (locale: SupportedLocale = DEFAULT_LOCALE) => {
  return createIntl({
    locale,
    messages: messages[locale] || messages[DEFAULT_LOCALE],
  }, cache);
};

// Helper to format numbers
export const formatNumber = (intl: ReturnType<typeof createIntlInstance>, value: number) => {
  return intl.formatNumber(value);
};

// Helper to format dates
export const formatDate = (intl: ReturnType<typeof createIntlInstance>, value: Date | number) => {
  return intl.formatDate(value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper to format relative time
export const formatRelativeTime = (intl: ReturnType<typeof createIntlInstance>, value: number, unit: 'second' | 'minute' | 'hour' | 'day') => {
  return intl.formatRelativeTime(value, unit);
};
