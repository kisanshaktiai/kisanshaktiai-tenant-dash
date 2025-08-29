
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnboardingState {
  isOnboardingComplete: boolean;
  currentStep: number;
  totalSteps: number;
}

const initialState: OnboardingState = {
  isOnboardingComplete: false,
  currentStep: 0,
  totalSteps: 7,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingComplete = action.payload;
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    resetOnboarding: (state) => {
      state.currentStep = 0;
      state.isOnboardingComplete = false;
    },
  },
});

export const {
  setOnboardingComplete,
  setCurrentStep,
  nextStep,
  prevStep,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
