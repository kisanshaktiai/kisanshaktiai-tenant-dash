
import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from './core/BaseApiService';

export interface ComprehensiveFarmerData {
  // Basic farmer info
  id: string;
  farmer_code: string;
  mobile_number?: string;
  farming_experience_years: number;
  total_land_acres: number;
  primary_crops: string[];
  farm_type: string;
  has_irrigation: boolean;
  has_storage: boolean;
  has_tractor: boolean;
  is_verified: boolean;
  total_app_opens: number;
  language_preference: string;
  metadata: any;
  created_at: string;
  
  // Aggregated data
  tags: FarmerTag[];
  notes: FarmerNote[];
  segments: string[];
  lands: FarmerLand[];
  cropHistory: CropHistoryItem[];
  healthAssessments: HealthAssessment[];
  communicationHistory: CommunicationItem[];
  
  // Calculated metrics
  metrics: {
    totalLandArea: number;
    cropDiversityIndex: number;
    engagementScore: number;
    healthScore: number;
    lastActivityDate: string;
    revenueScore: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  
  // Live status
  liveStatus: {
    isOnline: boolean;
    lastSeen: string;
    currentActivity: string;
  };
}

export interface FarmerTag {
  id: string;
  tag_name: string;
  tag_color?: string;
  created_at: string;
}

export interface FarmerNote {
  id: string;
  note_content: string;
  is_important: boolean;
  is_private: boolean;
  created_by: string;
  created_at: string;
}

export interface FarmerLand {
  id: string;
  area_acres: number;
  soil_type?: string;
  location?: any;
  irrigation_type?: string;
  crops?: string[];
}

export interface CropHistoryItem {
  id: string;
  crop_name: string;
  variety?: string;
  season?: string;
  yield_kg_per_acre?: number;
  planting_date?: string;
  harvest_date?: string;
  status: string;
}

export interface HealthAssessment {
  id: string;
  assessment_date: string;
  overall_health_score?: number;
  ndvi_avg?: number;
  alert_level: string;
  growth_stage?: string;
}

export interface CommunicationItem {
  id: string;
  communication_type: string;
  channel: string;
  status: string;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
}

export interface FarmerMetrics {
  totalFarmers: number;
  activeFarmers: number;
  averageEngagement: number;
  topCrops: { crop: string; count: number }[];
  riskDistribution: { low: number; medium: number; high: number };
}

export interface PaginatedFarmersResult {
  data: ComprehensiveFarmerData[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

class EnhancedFarmerDataService extends BaseApiService {
  async getComprehensiveFarmerData(tenantId: string, farmerId: string): Promise<ComprehensiveFarmerData> {
    try {
      // Get basic farmer data
      const { data: farmer, error: farmerError } = await supabase
        .from('farmers')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', farmerId)
        .single();

      if (farmerError) throw farmerError;

      // Get all related data in parallel
      const [
        tagsResult,
        notesResult,
        segmentsResult,
        landsResult,
        cropHistoryResult,
        healthAssessmentsResult
      ] = await Promise.all([
        this.getFarmerTags(tenantId, farmerId),
        this.getFarmerNotes(tenantId, farmerId),
        this.getFarmerSegments(tenantId, farmerId),
        this.getFarmerLands(tenantId, farmerId),
        this.getFarmerCropHistory(tenantId, farmerId),
        this.getFarmerHealthAssessments(tenantId, farmerId)
      ]);

      // Mock communication history since the table doesn't exist
      const communicationResult: CommunicationItem[] = [];

      // Calculate metrics
      const metrics = this.calculateFarmerMetrics(farmer, {
        lands: landsResult,
        cropHistory: cropHistoryResult,
        healthAssessments: healthAssessmentsResult,
        communications: communicationResult
      });

      // Get live status (placeholder for now)
      const liveStatus = {
        isOnline: Math.random() > 0.5, // Simulate online status
        lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        currentActivity: 'Viewing crop recommendations'
      };

      return {
        ...farmer,
        tags: tagsResult,
        notes: notesResult,
        segments: segmentsResult,
        lands: landsResult,
        cropHistory: cropHistoryResult,
        healthAssessments: healthAssessmentsResult,
        communicationHistory: communicationResult,
        metrics,
        liveStatus
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getFarmerTags(tenantId: string, farmerId?: string): Promise<FarmerTag[]> {
    // Since farmer_tags table may not exist, return mock data
    return [];
  }

  async getFarmerNotes(tenantId: string, farmerId: string): Promise<FarmerNote[]> {
    // Since farmer_notes table may not exist, return mock data
    return [];
  }

  async getFarmerSegments(tenantId: string, farmerId: string): Promise<string[]> {
    // Since farmer_segments table may not exist, return mock data
    return [];
  }

  async getFarmerLands(tenantId: string, farmerId: string): Promise<FarmerLand[]> {
    const { data, error } = await supabase
      .from('lands')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('farmer_id', farmerId);

    if (error) throw error;
    return data || [];
  }

  async getFarmerCropHistory(tenantId: string, farmerId: string): Promise<CropHistoryItem[]> {
    const { data: lands } = await supabase
      .from('lands')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('farmer_id', farmerId);

    if (!lands || lands.length === 0) return [];

    const landIds = lands.map(l => l.id);
    const { data, error } = await supabase
      .from('crop_history')
      .select('*')
      .eq('tenant_id', tenantId)
      .in('land_id', landIds)
      .order('planting_date', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  async getFarmerHealthAssessments(tenantId: string, farmerId: string): Promise<HealthAssessment[]> {
    const { data: lands } = await supabase
      .from('lands')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('farmer_id', farmerId);

    if (!lands || lands.length === 0) return [];

    const landIds = lands.map(l => l.id);
    const { data, error } = await supabase
      .from('crop_health_assessments')
      .select('*')
      .eq('tenant_id', tenantId)
      .in('land_id', landIds)
      .order('assessment_date', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  private calculateFarmerMetrics(farmer: any, relatedData: any) {
    const { lands, cropHistory, healthAssessments, communications } = relatedData;

    const totalLandArea = lands.reduce((sum: number, land: any) => sum + (land.area_acres || 0), 0);
    const uniqueCrops = [...new Set(cropHistory.map((ch: any) => ch.crop_name))];
    const cropDiversityIndex = uniqueCrops.length;

    // Calculate engagement score based on app opens and communications
    const engagementScore = Math.min(100, (farmer.total_app_opens * 2) + (communications.length * 5));

    // Calculate health score from assessments
    const recentHealthScores = healthAssessments
      .filter((ha: any) => ha.overall_health_score != null)
      .slice(0, 5)
      .map((ha: any) => ha.overall_health_score);
    
    const healthScore = recentHealthScores.length > 0 
      ? recentHealthScores.reduce((sum: number, score: number) => sum + score, 0) / recentHealthScores.length
      : 75; // Default health score

    // Calculate last activity date
    const lastActivityDate = communications.length > 0 
      ? communications[0].sent_at 
      : farmer.updated_at || farmer.created_at;

    // Calculate revenue score (simplified)
    const revenueScore = Math.min(100, totalLandArea * 10 + cropDiversityIndex * 5);

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (engagementScore < 30 || healthScore < 50) {
      riskLevel = 'high';
    } else if (engagementScore < 60 || healthScore < 70) {
      riskLevel = 'medium';
    }

    return {
      totalLandArea,
      cropDiversityIndex,
      engagementScore,
      healthScore,
      lastActivityDate,
      revenueScore,
      riskLevel
    };
  }

  async getFarmersWithPagination(tenantId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
  } = {}): Promise<PaginatedFarmersResult> {
    const { page = 1, limit = 20, search, sortBy = 'created_at', sortOrder = 'desc', filters = {} } = options;
    
    let query = supabase
      .from('farmers')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId);

    // Apply search
    if (search) {
      query = query.or(`farmer_code.ilike.%${search}%,metadata->>full_name.ilike.%${search}%`);
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  async getFarmerMetrics(tenantId: string): Promise<FarmerMetrics> {
    const [farmersResult, cropStatsResult] = await Promise.all([
      supabase
        .from('farmers')
        .select('id, total_app_opens, created_at')
        .eq('tenant_id', tenantId),
      supabase
        .from('crop_history')
        .select('crop_name, tenant_id')
        .eq('tenant_id', tenantId)
    ]);

    const totalFarmers = farmersResult.data?.length || 0;
    const activeFarmers = farmersResult.data?.filter(f => f.total_app_opens > 0).length || 0;
    const averageEngagement = totalFarmers > 0 
      ? (farmersResult.data?.reduce((sum, f) => sum + f.total_app_opens, 0) || 0) / totalFarmers 
      : 0;

    // Calculate top crops
    const cropCounts: Record<string, number> = {};
    cropStatsResult.data?.forEach(crop => {
      cropCounts[crop.crop_name] = (cropCounts[crop.crop_name] || 0) + 1;
    });

    const topCrops = Object.entries(cropCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([crop, count]) => ({ crop, count }));

    // Simulate risk distribution (in real implementation, calculate from actual data)
    const riskDistribution = {
      low: Math.floor(totalFarmers * 0.6),
      medium: Math.floor(totalFarmers * 0.3),
      high: Math.floor(totalFarmers * 0.1)
    };

    return {
      totalFarmers,
      activeFarmers,
      averageEngagement,
      topCrops,
      riskDistribution
    };
  }
}

export const enhancedFarmerDataService = new EnhancedFarmerDataService();
