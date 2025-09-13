export interface Farmer {
  id: string;
  tenant_id: string | null;
  farmer_code: string | null;
  farmer_name: string | null;
  mobile_number: string | null;
  metadata: any | null;
  verification_status?: string;
  farming_experience_years: number | null;
  total_land_acres: number | null;
  primary_crops: string[] | null;
  farm_type: string | null;
  has_irrigation: boolean | null;
  has_storage: boolean | null;
  has_tractor: boolean | null;
  irrigation_type: string | null;
  is_verified: boolean | null;
  total_app_opens: number | null;
  total_queries: number | null;
  created_at: string | null;
  updated_at: string | null;
  location: string | null;
  language_preference: string | null;
  annual_income_range: string | null;
  preferred_contact_method: string | null;
  notes: string | null;
  aadhaar_number: string | null;
}

export interface FarmerMetadata {
  personal_info?: {
    full_name?: string;
    profile_picture?: string;
    email?: string;
    date_of_birth?: string;
    gender?: string;
    language_preference?: string;
  };
  address_info?: {
    village?: string;
    taluka?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  farming_info?: {
    total_land_area?: string | number;
    primary_crops?: string[];
    irrigation_type?: string;
    farm_type?: string;
  };
  user_profile_id?: string;
}