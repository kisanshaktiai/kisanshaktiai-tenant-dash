
// Utility to map between different subscription plan naming conventions
export const SUBSCRIPTION_PLAN_MAP = {
  // Database values -> UI display values
  'Kisan_Basic': 'kisan',
  'Shakti_Growth': 'shakti', 
  'AI_Enterprise': 'ai',
  'custom': 'custom',
  
  // Reverse mapping for UI -> Database
  'kisan': 'Kisan_Basic',
  'shakti': 'Shakti_Growth',
  'ai': 'AI_Enterprise',
} as const;

export const mapPlanToDatabase = (uiPlan: string): string => {
  return SUBSCRIPTION_PLAN_MAP[uiPlan as keyof typeof SUBSCRIPTION_PLAN_MAP] || uiPlan;
};

export const mapPlanToUI = (dbPlan: string): string => {
  return SUBSCRIPTION_PLAN_MAP[dbPlan as keyof typeof SUBSCRIPTION_PLAN_MAP] || dbPlan;
};

export const isKisanPlan = (plan: string): boolean => {
  return plan === 'Kisan_Basic' || plan === 'kisan';
};

export const isShaktiPlan = (plan: string): boolean => {
  return plan === 'Shakti_Growth' || plan === 'shakti';
};

export const isAIPlan = (plan: string): boolean => {
  return plan === 'AI_Enterprise' || plan === 'ai';
};
