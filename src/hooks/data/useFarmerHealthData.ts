import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';

export interface SoilHealthData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicCarbon: number;
  lastTestDate: string;
}

export interface NDVIData {
  date: string;
  value: number;
  average: number;
  min: number;
  max: number;
}

export interface CropHealthAssessment {
  date: string;
  healthScore: number;
  alertLevel: 'normal' | 'warning' | 'critical';
  growthStage: string;
  ndviAvg: number;
  stressIndicators: {
    water: number;
    nutrient: number;
    pest: number;
    disease: number;
  };
}

export const useFarmerSoilHealth = (farmerId: string) => {
  const { currentTenant } = useTenantIsolation();

  return useQuery({
    queryKey: ['farmer-soil-health', currentTenant?.id, farmerId],
    queryFn: async () => {
      if (!currentTenant) throw new Error('No tenant context');

      // Get farmer's lands
      const { data: lands, error: landsError } = await supabase
        .from('lands')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (landsError) throw landsError;
      if (!lands || lands.length === 0) return null;

      const land = lands[0];

      // Return soil health data from the land record
      const soilHealth: SoilHealthData = {
        ph: land.soil_ph || 7.0,
        nitrogen: land.nitrogen_kg_per_ha || 280,
        phosphorus: land.phosphorus_kg_per_ha || 25,
        potassium: land.potassium_kg_per_ha || 200,
        organicCarbon: land.organic_carbon_percent || 0.5,
        lastTestDate: land.last_soil_test_date || new Date().toISOString()
      };

      return soilHealth;
    },
    enabled: !!currentTenant && !!farmerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFarmerNDVIHistory = (farmerId: string) => {
  const { currentTenant } = useTenantIsolation();

  return useQuery({
    queryKey: ['farmer-ndvi-history', currentTenant?.id, farmerId],
    queryFn: async () => {
      if (!currentTenant) throw new Error('No tenant context');

      // Get farmer's lands
      const { data: lands, error: landsError } = await supabase
        .from('lands')
        .select('id')
        .eq('tenant_id', currentTenant.id)
        .eq('farmer_id', farmerId);

      if (landsError) throw landsError;
      if (!lands || lands.length === 0) return [];

      const landIds = lands.map(l => l.id);

      // Get health assessments with NDVI data
      const { data: assessments, error: assessmentsError } = await supabase
        .from('crop_health_assessments')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .in('land_id', landIds)
        .order('assessment_date', { ascending: false })
        .limit(30);

      if (assessmentsError) throw assessmentsError;

      // Transform to NDVI history format
      const ndviHistory: NDVIData[] = (assessments || []).map(a => ({
        date: new Date(a.assessment_date).toLocaleDateString(),
        value: a.ndvi_avg || 0,
        average: a.ndvi_avg || 0,
        min: a.ndvi_min || 0,
        max: a.ndvi_max || 0
      }));

      return ndviHistory;
    },
    enabled: !!currentTenant && !!farmerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFarmerHealthAssessments = (farmerId: string) => {
  const { currentTenant } = useTenantIsolation();

  return useQuery({
    queryKey: ['farmer-health-assessments', currentTenant?.id, farmerId],
    queryFn: async () => {
      if (!currentTenant) throw new Error('No tenant context');

      // Get farmer's lands
      const { data: lands, error: landsError } = await supabase
        .from('lands')
        .select('id')
        .eq('tenant_id', currentTenant.id)
        .eq('farmer_id', farmerId);

      if (landsError) throw landsError;
      if (!lands || lands.length === 0) return [];

      const landIds = lands.map(l => l.id);

      // Get health assessments
      const { data: assessments, error: assessmentsError } = await supabase
        .from('crop_health_assessments')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .in('land_id', landIds)
        .order('assessment_date', { ascending: false })
        .limit(10);

      if (assessmentsError) throw assessmentsError;

      // Transform to health assessment format
      const healthAssessments: CropHealthAssessment[] = (assessments || []).map(a => {
        // Parse stress indicators safely
        let stressIndicators = { water: 0, nutrient: 0, pest: 0, disease: 0 };
        if (a.stress_indicators && typeof a.stress_indicators === 'object') {
          const indicators = a.stress_indicators as any;
          stressIndicators = {
            water: indicators.water || 0,
            nutrient: indicators.nutrient || 0,
            pest: indicators.pest || 0,
            disease: indicators.disease || 0
          };
        }

        return {
          date: new Date(a.assessment_date).toLocaleDateString(),
          healthScore: a.overall_health_score || 0,
          alertLevel: (a.alert_level || 'normal') as 'normal' | 'warning' | 'critical',
          growthStage: a.growth_stage || 'Unknown',
          ndviAvg: a.ndvi_avg || 0,
          stressIndicators
        };
      });

      return healthAssessments;
    },
    enabled: !!currentTenant && !!farmerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFarmerCompleteHealthData = (farmerId: string) => {
  const soilHealthQuery = useFarmerSoilHealth(farmerId);
  const ndviHistoryQuery = useFarmerNDVIHistory(farmerId);
  const healthAssessmentsQuery = useFarmerHealthAssessments(farmerId);

  return {
    soilHealth: soilHealthQuery.data,
    ndviHistory: ndviHistoryQuery.data || [],
    healthAssessments: healthAssessmentsQuery.data || [],
    isLoading: soilHealthQuery.isLoading || ndviHistoryQuery.isLoading || healthAssessmentsQuery.isLoading,
    error: soilHealthQuery.error || ndviHistoryQuery.error || healthAssessmentsQuery.error
  };
};