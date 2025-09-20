import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';

interface WeatherData {
  currentTemp: number;
  humidity: number;
  weatherCondition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  windSpeed: number;
  precipitation: number;
}

interface NDVIData {
  score: number;
  trend: 'up' | 'down' | 'stable';
  historicalData: Array<{ date: string; value: number }>;
}

interface SoilHealthData {
  rating: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
}

export interface Modern2025FarmerData {
  id: string;
  farmerName: string;
  farmerCode: string;
  mobileNumber: string;
  village: string;
  district: string;
  state: string;
  avatarUrl?: string;
  isVerified: boolean;
  farmingExperience: number;
  
  // Land data
  totalLandAcres: number;
  plotCount: number;
  primaryCrops: string[];
  hasIrrigation: boolean;
  hasTractor: boolean;
  hasStorage: boolean;
  
  // Health metrics
  ndviScore: number;
  ndviTrend: 'up' | 'down' | 'stable';
  soilHealthRating: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  
  // Weather
  currentTemp: number;
  humidity: number;
  weatherCondition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  
  // Engagement
  engagementScore: number;
  lastSeenHours: number;
  totalAppOpens: number;
  
  // Risk
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
}

export const useModern2025FarmerData = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();

  const fetchComprehensiveData = async (): Promise<Modern2025FarmerData> => {
    if (!currentTenant?.id) {
      throw new Error('No tenant context');
    }

    // Fetch farmer basic data
    const { data: farmerData, error: farmerError } = await supabase
      .from('farmers')
      .select('*')
      .eq('id', farmerId)
      .eq('tenant_id', currentTenant.id)
      .single();

    if (farmerError) throw farmerError;

    // Fetch land data
    const { data: landData, error: landError } = await supabase
      .from('lands')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('tenant_id', currentTenant.id);

    if (landError) throw landError;

    // Mock NDVI data for now (no ndvi_value field in crop_health_assessments)
    let ndviTrend: 'up' | 'down' | 'stable' = 'stable';
    let latestNdvi = 0.65 + Math.random() * 0.3;

    // Calculate soil health rating based on available fields
    const avgSoilHealth = landData?.reduce((acc, land) => {
      const score = (land.soil_ph || 7) / 14 + 0.5; // Using soil_ph if available
      return acc + score / 2;
    }, 0) / (landData?.length || 1);

    const soilHealthRating = 
      avgSoilHealth > 0.75 ? 'Excellent' :
      avgSoilHealth > 0.5 ? 'Good' :
      avgSoilHealth > 0.25 ? 'Moderate' : 'Poor';

    // Calculate engagement score
    const totalAppOpens = farmerData?.total_app_opens || 0;
    const daysSinceLastLogin = farmerData?.last_login_at 
      ? Math.floor((Date.now() - new Date(farmerData.last_login_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    const engagementScore = Math.min(100, Math.max(0, 
      (totalAppOpens * 2) + (100 - daysSinceLastLogin * 5)
    ));

    // Calculate risk level
    let riskScore = 0;
    const riskFactors = [];
    
    if (daysSinceLastLogin > 30) {
      riskScore += 30;
      riskFactors.push('Inactive for 30+ days');
    }
    if (!farmerData?.has_irrigation) {
      riskScore += 20;
      riskFactors.push('No irrigation');
    }
    if (soilHealthRating === 'Poor') {
      riskScore += 25;
      riskFactors.push('Poor soil health');
    }
    if (latestNdvi < 0.5) {
      riskScore += 25;
      riskFactors.push('Low NDVI');
    }

    const riskLevel = riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low';

    // Mock weather data (replace with actual weather API call)
    const weatherConditions = ['sunny', 'cloudy', 'rainy'] as const;
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

    // Compile comprehensive data using actual database fields
    return {
      id: farmerData.id,
      farmerName: `Farmer ${farmerData.farmer_code?.slice(-4) || ''}`,
      farmerCode: farmerData.farmer_code,
      mobileNumber: farmerData.mobile_number,
      village: farmerData.location || 'Village',
      district: farmerData.location || 'District', 
      state: farmerData.location || 'State',
      avatarUrl: undefined,
      isVerified: farmerData.is_verified || false,
      farmingExperience: farmerData.farming_experience_years || 0,
      
      totalLandAcres: landData?.reduce((sum, land) => sum + (land.area_acres || 0), 0) || 0,
      plotCount: landData?.length || 0,
      primaryCrops: farmerData.primary_crops || [],
      hasIrrigation: farmerData.has_irrigation || false,
      hasTractor: farmerData.has_tractor || false,
      hasStorage: farmerData.has_storage || false,
      
      ndviScore: latestNdvi,
      ndviTrend,
      soilHealthRating,
      
      currentTemp: 25 + Math.floor(Math.random() * 10),
      humidity: 60 + Math.floor(Math.random() * 20),
      weatherCondition: randomWeather,
      
      engagementScore,
      lastSeenHours: daysSinceLastLogin * 24,
      totalAppOpens,
      
      riskLevel,
      riskFactors
    };
  };

  const query = useQuery({
    queryKey: ['modern2025-farmer', currentTenant?.id, farmerId],
    queryFn: fetchComprehensiveData,
    enabled: !!currentTenant?.id && !!farmerId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentTenant?.id || !farmerId) return;

    const channel = supabase
      .channel(`farmer-updates-${farmerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmers',
          filter: `id=eq.${farmerId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['modern2025-farmer', currentTenant.id, farmerId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lands',
          filter: `farmer_id=eq.${farmerId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['modern2025-farmer', currentTenant.id, farmerId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crop_health_assessments',
          filter: `farmer_id=eq.${farmerId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['modern2025-farmer', currentTenant.id, farmerId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, farmerId, queryClient]);

  return query;
};