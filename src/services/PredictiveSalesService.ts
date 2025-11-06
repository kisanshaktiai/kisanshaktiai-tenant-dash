import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from './core/BaseApiService';

export interface FarmerUpcomingNeed {
  tenant_id: string;
  farmer_id: string;
  farmer_name: string;
  mobile_number: string;
  location: string;
  crop_name: string;
  crop_variety: string;
  task_id: string;
  task_date: string;
  task_type: string;
  task_name: string;
  resources: any;
  estimated_cost: number;
  days_until_task: number;
}

export interface ProductDemand {
  product_type: string;
  predicted_demand: number;
  urgency_level: string;
}

export interface InventoryGap {
  product_type: string;
  current_stock: number;
  predicted_demand: number;
  gap: number;
  gap_percentage: number;
  urgency_level: 'urgent' | 'high' | 'medium' | 'low';
  reorder_needed?: boolean;
}

export interface SalesOpportunity {
  farmer_id: string;
  farmer_name: string;
  mobile_number: string;
  location: string;
  task_date: string;
  task_name: string;
  task_type: string;
  days_until_task: number;
  products_needed: Array<{
    product_type: string;
    quantity: number;
    in_stock: boolean;
  }>;
}

class PredictiveSalesService extends BaseApiService {
  /**
   * Get upcoming needs for a specific farmer
   */
  async getFarmerUpcomingNeeds(
    tenantId: string,
    farmerId: string,
    days: number = 30
  ): Promise<FarmerUpcomingNeed[]> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('farmer_upcoming_needs')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('farmer_id', farmerId)
        .lte('days_until_task', days)
        .gte('days_until_task', 0)
        .order('task_date', { ascending: true });

      return { data: data || [], error };
    });
  }

  /**
   * Get aggregate demand forecast for tenant
   */
  async getTenantDemandForecast(
    tenantId: string,
    days: number = 30
  ): Promise<ProductDemand[]> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase.rpc('calculate_product_demand', {
        p_tenant_id: tenantId,
        p_days: days,
      });

      return { data: data || [], error };
    });
  }

  /**
   * Match inventory with predicted demand
   */
  async matchInventoryWithDemand(
    tenantId: string,
    days: number = 30
  ): Promise<InventoryGap[]> {
    const result = await this.executeQuery(async () => {
      const { data, error } = await supabase.rpc('get_inventory_gap', {
        p_tenant_id: tenantId,
        p_days: days,
      });

      return { data: data || [], error };
    });

    // Cast urgency_level to proper type and add reorder flag
    return result.map((item: any) => ({
      ...item,
      urgency_level: item.urgency_level as 'urgent' | 'high' | 'medium' | 'low',
      reorder_needed: item.gap > 0,
    }));
  }

  /**
   * Get proactive sales opportunities
   */
  async getProactiveSalesOpportunities(
    tenantId: string,
    days: number = 7
  ): Promise<SalesOpportunity[]> {
    try {
      // Get upcoming needs
      const needs = await this.executeQuery(async () => {
        const { data, error } = await supabase
          .from('farmer_upcoming_needs')
          .select('*')
          .eq('tenant_id', tenantId)
          .lte('days_until_task', days)
          .gte('days_until_task', 0)
          .order('task_date', { ascending: true });

        return { data: data || [], error };
      });

      // Get inventory status
      const inventory = await this.matchInventoryWithDemand(tenantId, days);
      const inventoryMap = new Map(
        inventory.map((item) => [item.product_type, item])
      );

      // Get all unique task types
      const uniqueTaskTypes = [...new Set(needs.map((n: FarmerUpcomingNeed) => n.task_type))];
      
      // Fetch all task-product mappings at once
      const allMappings = await Promise.all(
        uniqueTaskTypes.map((taskType) => 
          this.getTaskProductMapping(tenantId, taskType)
        )
      );

      // Create a map of task type to product mappings
      const taskMappingMap = new Map(
        uniqueTaskTypes.map((taskType, index) => [taskType, allMappings[index]])
      );

      // Group by farmer
      const farmerMap = new Map<string, SalesOpportunity>();

      needs.forEach((need: FarmerUpcomingNeed) => {
        const farmerId = need.farmer_id;

        if (!farmerMap.has(farmerId)) {
          farmerMap.set(farmerId, {
            farmer_id: need.farmer_id,
            farmer_name: need.farmer_name,
            mobile_number: need.mobile_number,
            location: need.location,
            task_date: need.task_date,
            task_name: need.task_name,
            task_type: need.task_type,
            days_until_task: need.days_until_task,
            products_needed: [],
          });
        }

        const opportunity = farmerMap.get(farmerId)!;
        const taskProductMappings = taskMappingMap.get(need.task_type) || [];

        taskProductMappings.forEach((mapping: any) => {
          const inventoryItem = inventoryMap.get(mapping.product_type);
          const quantity = need.resources?.quantity || 1;

          opportunity.products_needed.push({
            product_type: mapping.product_type,
            quantity: quantity * mapping.quantity_multiplier,
            in_stock: inventoryItem
              ? inventoryItem.current_stock >= quantity
              : false,
          });
        });
      });

      return Array.from(farmerMap.values());
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate farmer contact list by product type
   */
  async generateFarmerContactList(
    tenantId: string,
    productType: string,
    days: number = 7
  ): Promise<Array<{
    farmer_id: string;
    farmer_name: string;
    mobile_number: string;
    location: string;
    task_date: string;
    task_name: string;
  }>> {
    try {
      // Get task types that require this product
      const taskTypes = await this.executeQuery(async () => {
        const { data, error } = await supabase
          .from('task_product_mappings')
          .select('task_type')
          .eq('tenant_id', tenantId)
          .eq('product_type', productType);

        return { data: data || [], error };
      });

      const taskTypeList = taskTypes.map((t: any) => t.task_type);

      if (taskTypeList.length === 0) {
        return [];
      }

      // Get farmers with upcoming tasks of these types
      return this.executeQuery(async () => {
        const { data, error } = await supabase
          .from('farmer_upcoming_needs')
          .select('farmer_id, farmer_name, mobile_number, location, task_date, task_name')
          .eq('tenant_id', tenantId)
          .in('task_type', taskTypeList)
          .lte('days_until_task', days)
          .gte('days_until_task', 0)
          .order('task_date', { ascending: true });

        return { data: data || [], error };
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get task-product mappings for a task type
   */
  private async getTaskProductMapping(
    tenantId: string,
    taskType: string
  ): Promise<any[]> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('task_product_mappings')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('task_type', taskType);

      return { data: data || [], error };
    });
  }

  /**
   * Refresh the materialized view
   */
  async refreshUpcomingNeeds(): Promise<void> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase.rpc('refresh_farmer_upcoming_needs');
      return { data, error };
    });
  }

  /**
   * Get predictive sales metrics
   */
  async getPredictiveSalesMetrics(
    tenantId: string,
    days: number = 30
  ): Promise<{
    totalFarmersWithNeeds: number;
    totalPredictedValue: number;
    productsLowStock: number;
    urgentContacts: number;
  }> {
    try {
      const [needs, inventory] = await Promise.all([
        this.executeQuery(async () => {
          const { data, error } = await supabase
            .from('farmer_upcoming_needs')
            .select('farmer_id, estimated_cost')
            .eq('tenant_id', tenantId)
            .lte('days_until_task', days)
            .gte('days_until_task', 0);

          return { data: data || [], error };
        }),
        this.matchInventoryWithDemand(tenantId, days),
      ]);

      const uniqueFarmers = new Set(needs.map((n: any) => n.farmer_id));
      const totalValue = needs.reduce((sum: number, n: any) => sum + (n.estimated_cost || 0), 0);
      const lowStock = inventory.filter((i) => i.reorder_needed).length;
      const urgent = needs.filter((n: any) => n.days_until_task <= 3).length;

      return {
        totalFarmersWithNeeds: uniqueFarmers.size,
        totalPredictedValue: totalValue,
        productsLowStock: lowStock,
        urgentContacts: urgent,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const predictiveSalesService = new PredictiveSalesService();
