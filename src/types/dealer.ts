
export interface DealerTerritory {
  id: string;
  tenant_id: string;
  territory_name: string;
  territory_code: string;
  description?: string;
  geographic_boundaries: Record<string, any>;
  coverage_areas: string[];
  population_data: Record<string, any>;
  market_potential: Record<string, any>;
  assigned_dealers: string[];
  territory_manager_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DealerPerformance {
  id: string;
  tenant_id: string;
  dealer_id: string;
  performance_period: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  sales_target: number;
  sales_achieved: number;
  farmers_acquired: number;
  farmers_target: number;
  product_sales: Record<string, any>;
  response_time_avg: number;
  customer_satisfaction_score: number;
  commission_earned: number;
  performance_score: number;
  ranking?: number;
  achievements: string[];
  improvement_areas: string[];
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface DealerCommunication {
  id: string;
  tenant_id: string;
  title: string;
  content?: string;
  communication_type: 'announcement' | 'training' | 'notification' | 'message';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sender_id: string;
  recipient_ids: string[];
  attachments: any[];
  delivery_status: Record<string, any>;
  read_receipts: Record<string, any>;
  scheduled_at?: string;
  sent_at?: string;
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DealerIncentive {
  id: string;
  tenant_id: string;
  dealer_id?: string;
  incentive_name: string;
  incentive_type: 'commission' | 'bonus' | 'reward' | 'contest';
  calculation_method: 'percentage' | 'fixed' | 'tiered' | 'performance_based';
  criteria: Record<string, any>;
  reward_structure: Record<string, any>;
  eligibility_rules: Record<string, any>;
  period_start: string;
  period_end: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  total_budget?: number;
  amount_allocated: number;
  amount_paid: number;
  participants_count: number;
  winners: any[];
  leaderboard: any[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DealerOnboardingStep {
  id: string;
  tenant_id: string;
  dealer_id: string;
  step_name: string;
  step_type: 'document_upload' | 'verification' | 'training' | 'agreement';
  step_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  required_documents: string[];
  submitted_documents: any[];
  verification_data: Record<string, any>;
  completion_data: Record<string, any>;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EnhancedDealer extends Dealer {
  alternate_phone?: string;
  address: Record<string, any>;
  business_type?: string;
  registration_status: string;
  onboarding_status: string;
  kyc_status: string;
  territory_id?: string;
  product_authorizations: string[];
  commission_structure: Record<string, any>;
  performance_metrics: Record<string, any>;
  banking_details: Record<string, any>;
  documents: any[];
  notes?: string;
  verified_at?: string;
  verified_by?: string;
}

export interface Dealer {
  id: string;
  tenant_id: string;
  dealer_code: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  is_active: boolean;
  verification_status: string;
  created_at: string;
  updated_at: string;
}
