import { SoilHealthData } from '@/services/SoilAnalysisService';

/**
 * Calculate progress percentage for NPK nutrient levels
 */
export function calculateNPKProgress(value: number | null, nutrient: 'N' | 'P' | 'K'): number {
  if (!value) return 0;
  
  const thresholds = {
    N: { low: 280, high: 560 },
    P: { low: 11, high: 22 },
    K: { low: 110, high: 280 }
  };
  
  const { low, high } = thresholds[nutrient];
  return Math.min(100, (value / high) * 100);
}

/**
 * Get badge variant based on nutrient level
 */
export function getNPKBadgeVariant(level: string | null): 'destructive' | 'default' | 'secondary' {
  if (level === 'low') return 'destructive';
  if (level === 'medium' || level === 'medium-high') return 'default';
  return 'secondary';
}

/**
 * Get confidence badge classes
 */
export function getConfidenceBadge(confidence: string | null): string {
  const badges = {
    high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  return badges[confidence as keyof typeof badges] || badges.low;
}

/**
 * Format NPK summary with total field amounts
 */
export function formatNPKSummary(soilData: SoilHealthData | undefined, areaAcres: number): string {
  if (!soilData) return 'No soil data available';
  
  const areaHa = areaAcres * 0.404686;
  return `N: ${soilData.nitrogen_total_kg?.toFixed(1) || '—'} kg | ` +
         `P: ${soilData.phosphorus_total_kg?.toFixed(1) || '—'} kg | ` +
         `K: ${soilData.potassium_total_kg?.toFixed(1) || '—'} kg ` +
         `(${areaHa.toFixed(2)} ha)`;
}

/**
 * Get pH level classification
 */
export function getPhClassification(ph: number | null): { label: string; color: string } {
  if (!ph) return { label: 'Unknown', color: 'gray' };
  
  if (ph < 5.5) return { label: 'Acidic', color: 'orange' };
  if (ph < 6.5) return { label: 'Slightly Acidic', color: 'yellow' };
  if (ph <= 7.5) return { label: 'Neutral', color: 'green' };
  if (ph <= 8.5) return { label: 'Slightly Alkaline', color: 'blue' };
  return { label: 'Alkaline', color: 'purple' };
}

/**
 * Get organic carbon classification
 */
export function getOCClassification(oc: number | null): { label: string; color: string } {
  if (!oc) return { label: 'Unknown', color: 'gray' };
  
  if (oc < 0.5) return { label: 'Low', color: 'red' };
  if (oc < 1.0) return { label: 'Moderate', color: 'yellow' };
  if (oc < 1.5) return { label: 'High', color: 'green' };
  return { label: 'Very High', color: 'blue' };
}

/**
 * Calculate data completeness percentage
 */
export function calculateCompleteness(soilData: SoilHealthData | undefined): number {
  if (!soilData) return 0;
  
  if (soilData.data_completeness !== null && soilData.data_completeness !== undefined) {
    return soilData.data_completeness;
  }
  
  // Fallback calculation
  const fields = [
    soilData.ph_level,
    soilData.organic_carbon,
    soilData.nitrogen_level,
    soilData.phosphorus_level,
    soilData.potassium_level,
    soilData.clay_percent,
    soilData.sand_percent,
    soilData.silt_percent,
  ];
  
  const nonNull = fields.filter(f => f !== null && f !== undefined).length;
  return Math.round((nonNull / fields.length) * 100);
}
