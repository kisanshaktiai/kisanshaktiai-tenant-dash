
export interface OrganizationSettings {
  id: string;
  tenant_id: string;
  business_hours: BusinessHours;
  contact_info: ContactInfo;
  social_links: SocialLinks;
  compliance_settings: ComplianceSettings;
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export interface ContactInfo {
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface SocialLinks {
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface ComplianceSettings {
  certifications?: string[];
  licenses?: string[];
  regulatory_compliance?: string[];
}

export interface SecuritySettings {
  id: string;
  tenant_id: string;
  password_policy: PasswordPolicy;
  session_settings: SessionSettings;
  mfa_settings: MfaSettings;
  ip_whitelist: string[];
  login_restrictions: LoginRestrictions;
  audit_settings: AuditSettings;
  created_at: string;
  updated_at: string;
}

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_symbols: boolean;
  max_age_days?: number;
  history_count?: number;
}

export interface SessionSettings {
  timeout_minutes: number;
  remember_me_days: number;
  concurrent_sessions?: number;
  force_logout_on_password_change?: boolean;
}

export interface MfaSettings {
  enabled: boolean;
  required_for_admins: boolean;
  backup_codes: number;
  allowed_methods?: string[];
}

export interface LoginRestrictions {
  max_attempts: number;
  lockout_minutes: number;
  geo_restrictions?: string[];
}

export interface AuditSettings {
  log_all_actions: boolean;
  retention_days: number;
  log_failed_logins?: boolean;
  log_data_access?: boolean;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  tenant_id: string;
  email_notifications: EmailNotifications;
  push_notifications: PushNotifications;
  sms_notifications: SmsNotifications;
  in_app_notifications: InAppNotifications;
  notification_schedule: NotificationSchedule;
  created_at: string;
  updated_at: string;
}

export interface EmailNotifications {
  system: boolean;
  marketing: boolean;
  security: boolean;
  campaigns: boolean;
  reports?: boolean;
  reminders?: boolean;
}

export interface PushNotifications {
  enabled: boolean;
  sound: boolean;
  badge: boolean;
}

export interface SmsNotifications {
  enabled: boolean;
  security_alerts: boolean;
  campaign_updates?: boolean;
}

export interface InAppNotifications {
  enabled: boolean;
  popup: boolean;
  sound: boolean;
}

export interface NotificationSchedule {
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  timezone?: string;
}

export interface DataPrivacySettings {
  id: string;
  tenant_id: string;
  data_retention_policy: DataRetentionPolicy;
  anonymization_settings: AnonymizationSettings;
  gdpr_settings: GdprSettings;
  backup_settings: BackupSettings;
  encryption_settings: EncryptionSettings;
  third_party_sharing: ThirdPartySharing;
  created_at: string;
  updated_at: string;
}

export interface DataRetentionPolicy {
  user_data_days: number;
  audit_logs_days: number;
  analytics_days: number;
  inactive_user_days?: number;
}

export interface AnonymizationSettings {
  auto_anonymize: boolean;
  anonymize_after_days: number;
}

export interface GdprSettings {
  enabled: boolean;
  consent_required: boolean;
  data_portability: boolean;
  right_to_be_forgotten?: boolean;
}

export interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retention_days: number;
}

export interface EncryptionSettings {
  at_rest: boolean;
  in_transit: boolean;
  key_rotation_days: number;
}

export interface ThirdPartySharing {
  analytics: boolean;
  marketing: boolean;
  required_only: boolean;
}

export interface LocalizationSettings {
  id: string;
  tenant_id: string;
  default_language: string;
  supported_languages: string[];
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  currency: string;
  number_format: NumberFormat;
  regional_settings: RegionalSettings;
  custom_translations: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface NumberFormat {
  decimal_separator: string;
  thousand_separator: string;
  decimal_places: number;
}

export interface RegionalSettings {
  country: string;
  region: string;
}

export interface SubscriptionSettings {
  id: string;
  tenant_id: string;
  billing_contact: BillingContact;
  payment_methods: PaymentMethod[];
  billing_history: BillingRecord[];
  usage_quotas: UsageQuotas;
  feature_limits: FeatureLimits;
  auto_billing: boolean;
  billing_alerts: BillingAlerts;
  cancellation_settings: CancellationSettings;
  created_at: string;
  updated_at: string;
}

export interface BillingContact {
  name?: string;
  email?: string;
  phone?: string;
  address?: ContactInfo;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal';
  last_four?: string;
  expiry?: string;
  is_default: boolean;
}

export interface BillingRecord {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoice_url?: string;
}

export interface UsageQuotas {
  farmers_used: number;
  farmers_limit: number;
  dealers_used: number;
  dealers_limit: number;
  storage_used_gb: number;
  storage_limit_gb: number;
  api_calls_used: number;
  api_calls_limit: number;
}

export interface FeatureLimits {
  campaigns_per_month: number;
  reports_per_month: number;
  custom_fields: number;
  integrations: number;
}

export interface BillingAlerts {
  usage_threshold: number;
  overage_alerts: boolean;
  payment_failure_alerts?: boolean;
}

export interface CancellationSettings {
  immediate: boolean;
  end_of_period: boolean;
  retention_days?: number;
}
