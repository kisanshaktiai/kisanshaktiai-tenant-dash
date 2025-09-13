
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
      console.log('[EnhancedFarmerDataService] Fetching comprehensive data for farmer:', farmerId);
      
      // Get basic farmer data
      const { data: farmerData, error: farmerError } = await supabase
        .from('farmers')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', farmerId)
        .single();

      if (farmerError) throw farmerError;
      
      console.log('[EnhancedFarmerDataService] Farmer base data:', {
        id: farmerData.id,
        farmer_code: farmerData.farmer_code,
        total_land_acres: farmerData.total_land_acres,
        total_app_opens: farmerData.total_app_opens,
        is_verified: farmerData.is_verified,
        last_login_at: farmerData.last_login_at
      });

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
      
      console.log('[EnhancedFarmerDataService] Related data fetched:', {
        landsCount: landsResult.length,
        cropHistoryCount: cropHistoryResult.length,
        healthAssessmentsCount: healthAssessmentsResult.length,
        tagsCount: tagsResult.length,
        notesCount: notesResult.length
      });
      
      // Get real communication history if available
      const communicationResult = await this.getFarmerCommunications(tenantId, farmerId);

      // Calculate metrics
      const metrics = this.calculateFarmerMetrics(farmerData, {
        lands: landsResult,
        cropHistory: cropHistoryResult,
        healthAssessments: healthAssessmentsResult,
        communications: communicationResult
      });

      // Get live status based on actual data
      const liveStatus = {
        isOnline: (farmerData as any).is_online || false,
        lastSeen: farmerData.last_login_at || farmerData.updated_at || farmerData.created_at,
        currentActivity: (farmerData as any).current_activity || 'Offline'
      };

      // Transform the farmer data to match our interface
      const comprehensiveData: ComprehensiveFarmerData = {
        id: farmerData.id,
        farmer_code: farmerData.farmer_code,
        mobile_number: farmerData.mobile_number,
        farming_experience_years: farmerData.farming_experience_years || 0,
        total_land_acres: farmerData.total_land_acres || 0,
        primary_crops: farmerData.primary_crops || [],
        farm_type: farmerData.farm_type || 'small',
        has_irrigation: farmerData.has_irrigation || false,
        has_storage: farmerData.has_storage || false,
        has_tractor: farmerData.has_tractor || false,
        is_verified: farmerData.is_verified || false,
        total_app_opens: farmerData.total_app_opens || 0,
        language_preference: farmerData.language_preference || 'en',
        metadata: farmerData.metadata || {},
        created_at: farmerData.created_at,
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

      return comprehensiveData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getFarmerTags(tenantId: string, farmerId?: string): Promise<FarmerTag[]> {
    try {
      const { data, error } = await supabase
        .from('farmer_tags')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('farmer_id', farmerId);
      
      if (error) {
        console.warn('farmer_tags table may not exist:', error);
        return [];
      }
      
      return (data || []).map((tag: any) => ({
        id: tag.id,
        tag_name: tag.tag_name || tag.name || 'Tag',
        tag_color: tag.tag_color || tag.color,
        created_at: tag.created_at
      }));
    } catch (error) {
      console.error('Error fetching farmer tags:', error);
      return [];
    }
  }

  async getFarmerNotes(tenantId: string, farmerId: string): Promise<FarmerNote[]> {
    try {
      const { data, error } = await supabase
        .from('farmer_notes')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('farmer_notes table may not exist:', error);
        return [];
      }
      
      return (data || []).map((note: any) => ({
        id: note.id,
        note_content: note.note_content || note.content || '',
        is_important: note.is_important || false,
        is_private: note.is_private || false,
        created_by: note.created_by,
        created_at: note.created_at
      }));
    } catch (error) {
      console.error('Error fetching farmer notes:', error);
      return [];
    }
  }

  async getFarmerSegments(tenantId: string, farmerId: string): Promise<string[]> {
    try {
      // Query without chaining to avoid deep type instantiation
      const query = supabase.from('farmer_segments');
      const result = await query.select('segment_name');
      
      if ('error' in result && result.error) {
        console.warn('farmer_segments table may not exist:', result.error);
        return [];
      }
      
      const data = result.data;
      if (!data) return [];
      
      return data
        .filter((seg: any) => seg.tenant_id === tenantId && seg.farmer_id === farmerId)
        .map((seg: any) => seg.segment_name || '');
    } catch (error) {
      console.error('Error fetching farmer segments:', error);
      return [];
    }
  }
  
  async getFarmerCommunications(tenantId: string, farmerId: string): Promise<CommunicationItem[]> {
    try {
      const { data, error } = await supabase
        .from('farmer_communications')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('farmer_id', farmerId)
        .order('sent_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.warn('farmer_communications table may not exist:', error);
        return [];
      }
      
      return (data || []).map((comm: any) => ({
        id: comm.id,
        communication_type: comm.communication_type || comm.type || 'message',
        channel: comm.channel || 'app',
        status: comm.status || 'sent',
        sent_at: comm.sent_at || comm.created_at,
        delivered_at: comm.delivered_at,
        read_at: comm.read_at
      }));
    } catch (error) {
      console.error('Error fetching farmer communications:', error);
      return [];
    }
  }

  async getFarmerLands(tenantId: string, farmerId: string): Promise<FarmerLand[]> {
    try {
      const { data, error } = await supabase
        .from('lands')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('farmer_id', farmerId);

      if (error) throw error;
      
      // Map the actual database columns to our interface
      return (data || []).map((land: any) => ({
        id: land.id,
        area_acres: land.area_acres || 0,
        soil_type: land.soil_type || land.land_type || 'unknown',
        location: land.center_point_old || land.boundary || null,
        irrigation_type: land.water_source || 'unknown',
        crops: land.current_crop ? [land.current_crop] : []
      }));
    } catch (error) {
      console.error('Error fetching farmer lands:', error);
      return [];
    }
  }

  async getFarmerCropHistory(tenantId: string, farmerId: string): Promise<CropHistoryItem[]> {
    try {
      // First get lands for this farmer
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
      return (data || []).map((crop: any) => ({
        id: crop.id,
        crop_name: crop.crop_name,
        variety: crop.variety,
        season: crop.season,
        yield_kg_per_acre: crop.yield_kg_per_acre,
        planting_date: crop.planting_date,
        harvest_date: crop.harvest_date,
        status: crop.status || 'active'
      }));
    } catch (error) {
      console.error('Error fetching crop history:', error);
      return [];
    }
  }

  async getFarmerHealthAssessments(tenantId: string, farmerId: string): Promise<HealthAssessment[]> {
    try {
      // First get lands for this farmer
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
      return (data || []).map((assessment: any) => ({
        id: assessment.id,
        assessment_date: assessment.assessment_date,
        overall_health_score: assessment.overall_health_score,
        ndvi_avg: assessment.ndvi_avg,
        alert_level: assessment.alert_level || 'normal',
        growth_stage: assessment.growth_stage
      }));
    } catch (error) {
      console.error('Error fetching health assessments:', error);
      return [];
    }
  }

  private calculateFarmerMetrics(farmer: any, relatedData: any) {
    const { lands, cropHistory, healthAssessments, communications } = relatedData;

    const totalLandArea = lands.reduce((sum: number, land: any) => sum + (land.area_acres || 0), 0);
    const uniqueCrops = [...new Set(cropHistory.map((ch: any) => ch.crop_name))];
    const cropDiversityIndex = uniqueCrops.length;

    // Calculate engagement score based on app opens and communications  
    const baseEngagement = Math.min(100, ((farmer.total_app_opens || 0) * 2) + (communications.length * 5));
    const engagementScore = farmer.engagement_score || baseEngagement;

    // Calculate health score from assessments
    const recentHealthScores = healthAssessments
      .filter((ha: any) => ha.overall_health_score != null)
      .slice(0, 5)
      .map((ha: any) => ha.overall_health_score);
    
    const healthScore = recentHealthScores.length > 0 
      ? recentHealthScores.reduce((sum: number, score: number) => sum + score, 0) / recentHealthScores.length
      : farmer.health_score || 75; // Use farmer's health_score if available

    // Calculate last activity date
    const lastActivityDate = communications.length > 0 
      ? communications[0].sent_at 
      : farmer.updated_at || farmer.created_at;

    // Calculate revenue score (simplified)
    const revenueScore = Math.min(100, totalLandArea * 10 + cropDiversityIndex * 5);

    // Determine risk level based on multiple factors
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (engagementScore < 30 || healthScore < 50 || farmer.risk_level === 'high') {
      riskLevel = 'high';
    } else if (engagementScore < 60 || healthScore < 70 || farmer.risk_level === 'medium') {
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
    
    try {
      // Build query with explicit typing to avoid deep instantiation
      let baseQuery = supabase.from('farmers');
      
      const { data: farmersData, error, count } = await baseQuery
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .range((page - 1) * limit, page * limit - 1)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;

      // Create simplified transformation to avoid type complexity
      const transformedData: ComprehensiveFarmerData[] = [];
      
      if (farmersData) {
        for (const farmer of farmersData) {
          const transformed: ComprehensiveFarmerData = {
            id: farmer.id || '',
            farmer_code: farmer.farmer_code || '',
            mobile_number: farmer.mobile_number || undefined,
            farming_experience_years: farmer.farming_experience_years || 0,
            total_land_acres: farmer.total_land_acres || 0,
            primary_crops: farmer.primary_crops || [],
            farm_type: farmer.farm_type || 'small',
            has_irrigation: farmer.has_irrigation || false,
            has_storage: farmer.has_storage || false,
            has_tractor: farmer.has_tractor || false,
            is_verified: farmer.is_verified || false,
            total_app_opens: farmer.total_app_opens || 0,
            language_preference: farmer.language_preference || 'en',
            metadata: farmer.metadata || {},
            created_at: farmer.created_at || '',
            tags: [],
            notes: [],
            segments: [],
            lands: [],
            cropHistory: [],
            healthAssessments: [],
            communicationHistory: [],
            metrics: {
              totalLandArea: farmer.total_land_acres || 0,
              cropDiversityIndex: (farmer.primary_crops || []).length,
              engagementScore: (farmer as any).engagement_score || Math.min(100, (farmer.total_app_opens || 0) * 2),
              healthScore: (farmer as any).health_score || 75,
              lastActivityDate: (farmer as any).last_activity_date || farmer.last_login_at || farmer.updated_at || farmer.created_at || '',
              revenueScore: (farmer as any).revenue_score || Math.min(100, (farmer.total_land_acres || 0) * 10),
              riskLevel: (farmer as any).risk_level || ((farmer.total_app_opens || 0) < 10 ? 'high' : 'low') as 'low' | 'medium' | 'high'
            },
            liveStatus: {
              isOnline: (farmer as any).is_online || false,
              lastSeen: farmer.last_login_at || farmer.last_app_open || farmer.updated_at || new Date().toISOString(),
              currentActivity: (farmer as any).current_activity || 'Offline'
            }
          };
          transformedData.push(transformed);
        }
      }

      return {
        data: transformedData,
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getFarmerMetrics(tenantId: string): Promise<FarmerMetrics> {
    try {
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
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const enhancedFarmerDataService = new EnhancedFarmerDataService();
