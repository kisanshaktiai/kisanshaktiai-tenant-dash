
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnboardingState {
  isOnboardingComplete: boolean;
  currentStep: number;
  totalSteps: number;
  stepData: Record<string, any>;
  isCompleted: boolean;
}

const initialState: OnboardingState = {
  isOnboardingComplete: false,
  currentStep: 0,
  totalSteps: 7,
  stepData: {},
  isCompleted: false,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingComplete = action.payload;
      state.isCompleted = action.payload;
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
    previousStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    resetOnboarding: (state) => {
      state.currentStep = 0;
      state.isOnboardingComplete = false;
      state.isCompleted = false;
      state.stepData = {};
    },
    updateStepData: (state, action: PayloadAction<{ step: string; data: any }>) => {
      state.stepData[action.payload.step] = action.payload.data;
    },
  },
});

export const {
  setOnboardingComplete,
  setCurrentStep,
  nextStep,
  prevStep,
  previousStep,
  resetOnboarding,
  updateStepData,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
