
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

interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: 'agri_company' | 'ngo' | 'university' | 'government' | 'cooperative' | 'dealer' | 'sugar_factory' | 'insurance';
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  subscription_plan: 'kisan' | 'shakti' | 'ai';
  owner_name?: string;
  owner_email?: string;
  branding?: TenantBranding;
  features?: TenantFeatures;
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
}

interface TenantState {
  currentTenant: Tenant | null;
  userTenants: UserTenant[];
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
}

const initialState: TenantState = {
  currentTenant: null,
  userTenants: [],
  tenants: [],
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
      state.error = null;
    },
  },
});

export const {
  setCurrentTenant,
  setUserTenants,
  setTenants,
  setLoading,
  setError,
  clearTenantData,
} = tenantSlice.actions;

export default tenantSlice.reducer;
