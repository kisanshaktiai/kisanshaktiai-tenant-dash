
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TenantBranding {
  id: string;
  tenant_id: string;
  app_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
}

interface TenantFeatures {
  id: string;
  tenant_id: string;
  basic_analytics: boolean;
  advanced_analytics: boolean;
  ai_chat: boolean;
  weather_forecast: boolean;
  marketplace: boolean;
  community_forum: boolean;
  soil_testing: boolean;
  satellite_imagery: boolean;
  drone_monitoring: boolean;
  iot_integration: boolean;
  predictive_analytics: boolean;
  custom_reports: boolean;
  api_access: boolean;
  webhook_support: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_annually: number;
  max_farmers: number;
  max_dealers: number;
  max_products: number;
  max_storage_gb: number;
  max_api_calls_per_day: number;
  features: Record<string, any>;
  is_active: boolean;
}

interface TenantSubscription {
  id: string;
  tenant_id: string;
  plan_id?: string;
  status: 'trial' | 'active' | 'canceled' | 'past_due';
  billing_interval: 'monthly' | 'annually';
  current_period_start: string;
  current_period_end?: string;
  trial_end?: string;
  canceled_at?: string;
  plan?: SubscriptionPlan;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: 'agri_company' | 'ngo' | 'university' | 'government' | 'cooperative' | 'dealer' | 'sugar_factory' | 'insurance';
  status: 'active' | 'trial' | 'suspended' | 'cancelled' | 'archived' | 'pending_approval';
  subscription_plan: 'kisan' | 'shakti' | 'ai';
  owner_name?: string;
  owner_email?: string;
  branding?: TenantBranding;
  features?: TenantFeatures;
  subscription?: TenantSubscription;
  trial_ends_at?: string;
  max_farmers?: number;
  max_dealers?: number;
  max_products?: number;
  max_storage_gb?: number;
  max_api_calls_per_day?: number;
}

interface UserTenant {
  id: string;
  user_id: string;
  tenant_id: string;
  role: 'admin' | 'manager' | 'viewer' | 'dealer' | 'super_admin' | 'tenant_owner' | 'tenant_admin' | 'tenant_manager' | 'agent' | 'farmer';
  is_active: boolean;
  is_primary: boolean;
  department?: string;
  designation?: string;
  tenant?: Tenant;
}

interface OnboardingState {
  isComplete: boolean;
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;
  workflowId?: string;
}

interface TenantState {
  currentTenant: Tenant | null;
  userTenants: UserTenant[];
  tenants: Tenant[];
  subscriptionPlans: SubscriptionPlan[];
  onboarding: OnboardingState;
  loading: boolean;
  error: string | null;
}

const initialState: TenantState = {
  currentTenant: null,
  userTenants: [],
  tenants: [],
  subscriptionPlans: [],
  onboarding: {
    isComplete: false,
    currentStep: 0,
    totalSteps: 6,
    progressPercentage: 0
  },
  loading: false,
  error: null,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setCurrentTenant: (state, action: PayloadAction<Tenant | null>) => {
      state.currentTenant = action.payload;
    },
    setUserTenants: (state, action: PayloadAction<UserTenant[]>) => {
      state.userTenants = action.payload;
    },
    setTenants: (state, action: PayloadAction<Tenant[]>) => {
      state.tenants = action.payload;
    },
    setSubscriptionPlans: (state, action: PayloadAction<SubscriptionPlan[]>) => {
      state.subscriptionPlans = action.payload;
    },
    setOnboardingState: (state, action: PayloadAction<Partial<OnboardingState>>) => {
      state.onboarding = { ...state.onboarding, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearTenantData: (state) => {
      state.currentTenant = null;
      state.userTenants = [];
      state.tenants = [];
      state.subscriptionPlans = [];
      state.onboarding = initialState.onboarding;
      state.error = null;
    },
  },
});

export const {
  setCurrentTenant,
  setUserTenants,
  setTenants,
  setSubscriptionPlans,
  setOnboardingState,
  setLoading,
  setError,
  clearTenantData,
} = tenantSlice.actions;

export default tenantSlice.reducer;
