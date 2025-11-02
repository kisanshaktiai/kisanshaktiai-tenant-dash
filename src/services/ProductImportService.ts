
import { supabase } from '@/integrations/supabase/client';
import type { MasterProduct, MasterProductCategory } from './MasterDataService';

export interface DuplicateCheck {
  id: string;
  name: string;
  sku: string;
  brand: string;
  match_type: 'exact_sku' | 'name_brand_match' | 'similar';
}

export interface ImportPreview {
  masterItem: MasterProduct | MasterProductCategory;
  duplicate?: DuplicateCheck;
  action: 'create' | 'update' | 'skip';
  conflicts?: string[];
}

export interface ImportOptions {
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  applyPriceMarkup?: number; // Percentage
  setAsActive?: boolean;
  setAsFeatured?: boolean;
  defaultStock?: number;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  failed: number;
  skipped: number;
  errors: Array<{ item: string; error: string }>;
  historyId?: string;
}

class ProductImportService {
  async checkProductDuplicates(
    tenantId: string,
    products: MasterProduct[]
  ): Promise<Map<string, DuplicateCheck | null>> {
    const duplicateMap = new Map<string, DuplicateCheck | null>();

    for (const product of products) {
      try {
        const { data, error } = await supabase.rpc('check_product_duplicate', {
          p_tenant_id: tenantId,
          p_sku: product.sku || null,
          p_name: product.name || null,
          p_brand: product.brand || null,
        });

        if (error) throw error;
        const result = data?.[0];
        duplicateMap.set(product.id, result ? {
          id: result.id,
          name: result.name,
          sku: result.sku,
          brand: result.brand,
          match_type: result.match_type as 'exact_sku' | 'name_brand_match' | 'similar'
        } : null);
      } catch (error) {
        console.error(`Error checking duplicate for ${product.name}:`, error);
        duplicateMap.set(product.id, null);
      }
    }

    return duplicateMap;
  }

  async previewCategoryImport(
    tenantId: string,
    categories: MasterProductCategory[]
  ): Promise<ImportPreview[]> {
    const previews: ImportPreview[] = [];

    // Check for existing categories by master_category_id
    const { data: existingCategories } = await supabase
      .from('product_categories')
      .select('id, name, master_category_id')
      .eq('tenant_id', tenantId)
      .in('master_category_id', categories.map(c => c.id));

    const existingMap = new Map(
      existingCategories?.map(cat => [cat.master_category_id, cat]) || []
    );

    for (const category of categories) {
      const existing = existingMap.get(category.id);
      previews.push({
        masterItem: category,
        action: existing ? 'skip' : 'create',
        conflicts: existing ? [`Already imported to your catalog: ${existing.name}`] : undefined,
      });
    }

    return previews;
  }

  async previewProductImport(
    tenantId: string,
    products: MasterProduct[],
    options: ImportOptions = {}
  ): Promise<ImportPreview[]> {
    // First check for already imported products by master_product_id
    const { data: alreadyImported } = await supabase
      .from('products')
      .select('id, name, sku, master_product_id')
      .eq('tenant_id', tenantId)
      .in('master_product_id', products.map(p => p.id));

    const importedMap = new Map(
      alreadyImported?.map(p => [p.master_product_id, p]) || []
    );

    const duplicates = await this.checkProductDuplicates(tenantId, products);
    const previews: ImportPreview[] = [];

    for (const product of products) {
      // Check if already imported from master catalog
      const alreadyImportedProduct = importedMap.get(product.id);
      if (alreadyImportedProduct) {
        previews.push({
          masterItem: product,
          action: 'skip',
          conflicts: [`Already imported to your catalog: ${alreadyImportedProduct.name}`],
        });
        continue;
      }

      const duplicate = duplicates.get(product.id);
      let action: 'create' | 'update' | 'skip' = 'create';
      const conflicts: string[] = [];

      if (duplicate) {
        if (duplicate.match_type === 'exact_sku') {
          conflicts.push(`Exact SKU match found: ${duplicate.sku}`);
          action = options.updateExisting ? 'update' : 'skip';
        } else if (duplicate.match_type === 'name_brand_match') {
          conflicts.push(`Similar product found: ${duplicate.name} by ${duplicate.brand}`);
          action = options.skipDuplicates ? 'skip' : 'create';
        }
      }

      previews.push({
        masterItem: product,
        duplicate,
        action,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
      });
    }

    return previews;
  }

  async importCategories(
    tenantId: string,
    userId: string,
    categories: MasterProductCategory[],
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    // Sort categories to import parents first
    const sortedCategories = this.sortCategoriesByHierarchy(categories);

    // Create mapping for parent_id resolution
    const masterToTenantIdMap = new Map<string, string>();

    // Check for existing categories
    const { data: existingCategories } = await supabase
      .from('product_categories')
      .select('id, master_category_id')
      .eq('tenant_id', tenantId)
      .not('master_category_id', 'is', null);

    existingCategories?.forEach(cat => {
      if (cat.master_category_id) {
        masterToTenantIdMap.set(cat.master_category_id, cat.id);
      }
    });

    for (const category of sortedCategories) {
      try {
        const existing = masterToTenantIdMap.get(category.id);

        // Resolve parent_id if exists
        let tenantParentId = null;
        if (category.parent_id) {
          tenantParentId = masterToTenantIdMap.get(category.parent_id) || null;
        }

        const categoryData = {
          tenant_id: tenantId,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          parent_id: tenantParentId,
          is_active: options.setAsActive !== undefined ? options.setAsActive : category.is_active,
          master_category_id: category.id,
          metadata: category.metadata || {},
          import_metadata: {
            imported_at: new Date().toISOString(),
            imported_by: userId,
            source: 'master_catalog',
          },
        };

        if (existing) {
          const { data, error } = await supabase
            .from('product_categories')
            .update(categoryData)
            .eq('id', existing)
            .select()
            .single();

          if (error) throw error;
          result.updated++;
          masterToTenantIdMap.set(category.id, data.id);
        } else {
          const { data, error } = await supabase
            .from('product_categories')
            .insert(categoryData)
            .select()
            .single();

          if (error) throw error;
          result.imported++;
          masterToTenantIdMap.set(category.id, data.id);
        }
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          item: category.name,
          error: error.message,
        });
      }
    }

    // Log import history
    await this.logImportHistory(tenantId, userId, 'category', result);

    result.success = result.failed === 0;
    return result;
  }

  async importProducts(
    tenantId: string,
    userId: string,
    products: MasterProduct[],
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    const duplicates = await this.checkProductDuplicates(tenantId, products);

    // Get category mappings
    const { data: categoryMappings } = await supabase
      .from('product_categories')
      .select('id, master_category_id')
      .eq('tenant_id', tenantId)
      .not('master_category_id', 'is', null);

    const categoryMap = new Map(
      categoryMappings?.map(cat => [cat.master_category_id, cat.id]) || []
    );

    for (const product of products) {
      try {
        const duplicate = duplicates.get(product.id);

        // Skip logic
        if (duplicate && options.skipDuplicates && duplicate.match_type === 'exact_sku') {
          result.skipped++;
          continue;
        }

        // Map category_id
        let tenantCategoryId = null;
        if (product.category_id) {
          tenantCategoryId = categoryMap.get(product.category_id) || null;
        }

        // Calculate price with markup
        let finalPrice = product.price_per_unit || 0;
        if (options.applyPriceMarkup && options.applyPriceMarkup > 0) {
          finalPrice = finalPrice * (1 + options.applyPriceMarkup / 100);
        }

        const productData = {
          tenant_id: tenantId,
          sku: product.sku,
          name: product.name,
          brand: product.brand,
          category_id: tenantCategoryId,
          product_type: product.product_type,
          description: product.description,
          images: product.images || [],
          price_per_unit: finalPrice,
          unit_type: product.unit_of_measure,
          stock_quantity: options.defaultStock || 0,
          is_organic: product.organic_certified || false,
          is_active: options.setAsActive !== undefined ? options.setAsActive : true,
          is_featured: options.setAsFeatured || false,
          certifications: product.quality_certifications || [],
          specifications: {},
          master_product_id: product.id,
          company_id: product.company_id,
          import_metadata: {
            imported_at: new Date().toISOString(),
            imported_by: userId,
            source: 'master_catalog',
            original_price: product.price_per_unit,
            markup_applied: options.applyPriceMarkup || 0,
          },
        };

        if (duplicate && options.updateExisting && duplicate.match_type === 'exact_sku') {
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', duplicate.id);

          if (error) throw error;
          result.updated++;
        } else {
          const { error } = await supabase
            .from('products')
            .insert(productData);

          if (error) throw error;
          result.imported++;
        }
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          item: product.name,
          error: error.message,
        });
      }
    }

    // Log import history
    const history = await this.logImportHistory(tenantId, userId, 'product', result);
    result.historyId = history?.id;

    result.success = result.failed === 0;
    return result;
  }

  private sortCategoriesByHierarchy(categories: MasterProductCategory[]): MasterProductCategory[] {
    const sorted: MasterProductCategory[] = [];
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    const processed = new Set<string>();

    const addCategory = (category: MasterProductCategory) => {
      if (processed.has(category.id)) return;

      // Add parent first if exists and in our list
      if (category.parent_id && categoryMap.has(category.parent_id)) {
        addCategory(categoryMap.get(category.parent_id)!);
      }

      sorted.push(category);
      processed.add(category.id);
    };

    categories.forEach(cat => addCategory(cat));
    return sorted;
  }

  private async logImportHistory(
    tenantId: string,
    userId: string,
    type: 'category' | 'product',
    result: ImportResult
  ) {
    try {
      const { data, error } = await supabase
        .from('product_import_history')
        .insert({
          tenant_id: tenantId,
          import_type: type,
          imported_by: userId,
          items_imported: result.imported,
          items_updated: result.updated,
          items_failed: result.failed,
          items_skipped: result.skipped,
          error_log: result.errors,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to log import history:', error);
      return null;
    }
  }

  async getImportHistory(tenantId: string, limit = 20) {
    const { data, error } = await supabase
      .from('product_import_history')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

export const productImportService = new ProductImportService();
