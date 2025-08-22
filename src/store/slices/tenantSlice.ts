
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tenant, UserTenant, TenantBranding, TenantFeatures, TenantSubscription, SubscriptionPlan } from '@/types/tenant';

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
