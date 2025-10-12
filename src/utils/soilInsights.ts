export interface SoilInsight {
  parameter: string;
  condition: string;
  message: string;
  severity: 'success' | 'warning' | 'error' | 'info';
  icon: string;
  recommendations: string[];
  cropSuitability: string[];
}

/**
 * Generate AI-driven insights based on soil health parameters
 */
export function generateSoilInsights(soilData: {
  ph_level?: number | null;
  organic_carbon?: number | null;
  bulk_density?: number | null;
  nitrogen_level?: string | null;
  phosphorus_level?: string | null;
  potassium_level?: string | null;
  soil_type?: string | null;
}): SoilInsight[] {
  const insights: SoilInsight[] = [];

  // pH Level Analysis
  if (soilData.ph_level !== null && soilData.ph_level !== undefined) {
    const pH = soilData.ph_level;
    
    if (pH < 6.0) {
      insights.push({
        parameter: 'pH Level',
        condition: 'Acidic',
        message: 'Soil is slightly acidic — ideal for rice and sugarcane, but consider liming for crops like wheat or maize.',
        severity: 'warning',
        icon: '⚠️',
        recommendations: [
          'Apply agricultural lime (calcium carbonate) to raise pH',
          'Add dolomite lime for magnesium deficiency',
          'Consider wood ash application for minor pH adjustment',
          'Monitor pH regularly after amendments'
        ],
        cropSuitability: ['Rice', 'Sugarcane', 'Tea', 'Potato', 'Blueberries']
      });
    } else if (pH >= 6.5 && pH <= 7.5) {
      insights.push({
        parameter: 'pH Level',
        condition: 'Neutral',
        message: 'Soil pH is neutral — excellent for most crops.',
        severity: 'success',
        icon: '✅',
        recommendations: [
          'Maintain current pH levels',
          'Regular soil testing recommended',
          'Balanced fertilization approach'
        ],
        cropSuitability: ['Wheat', 'Maize', 'Cotton', 'Soybean', 'Most vegetables']
      });
    } else if (pH > 7.5) {
      insights.push({
        parameter: 'pH Level',
        condition: 'Alkaline',
        message: 'Soil is alkaline — add organic matter or sulfur-based amendments to reduce pH.',
        severity: 'warning',
        icon: '⚠️',
        recommendations: [
          'Apply elemental sulfur or iron sulfate',
          'Incorporate acidic organic matter like peat moss',
          'Use acidifying fertilizers like ammonium sulfate',
          'Improve drainage if waterlogging occurs'
        ],
        cropSuitability: ['Barley', 'Asparagus', 'Cabbage', 'Beets']
      });
    }
  }

  // Organic Carbon Analysis
  if (soilData.organic_carbon !== null && soilData.organic_carbon !== undefined) {
    const oc = soilData.organic_carbon;
    
    if (oc < 0.5) {
      insights.push({
        parameter: 'Organic Carbon',
        condition: 'Low',
        message: 'Low organic carbon — add compost or farmyard manure to improve soil fertility.',
        severity: 'error',
        icon: '🌱',
        recommendations: [
          'Apply 10-15 tons/ha of well-decomposed farmyard manure',
          'Incorporate crop residues and green manure',
          'Practice crop rotation with legumes',
          'Use vermicompost for faster nutrient availability',
          'Consider cover cropping in off-season'
        ],
        cropSuitability: ['Legumes for soil building', 'Green manure crops']
      });
    } else if (oc >= 0.5 && oc < 1.0) {
      insights.push({
        parameter: 'Organic Carbon',
        condition: 'Moderate',
        message: 'Moderate organic carbon — maintain with regular organic amendments.',
        severity: 'info',
        icon: '🌾',
        recommendations: [
          'Apply 5-8 tons/ha of organic manure annually',
          'Maintain crop residue incorporation',
          'Continue good soil management practices'
        ],
        cropSuitability: ['Most field crops', 'Cereals', 'Pulses']
      });
    } else {
      insights.push({
        parameter: 'Organic Carbon',
        condition: 'High',
        message: 'High organic carbon — very fertile soil, ideal for nutrient-intensive crops.',
        severity: 'success',
        icon: '✅',
        recommendations: [
          'Excellent soil health — maintain current practices',
          'Suitable for high-value crops',
          'Continue organic amendments for sustainability'
        ],
        cropSuitability: ['Vegetables', 'Fruits', 'High-value crops', 'Organic farming']
      });
    }
  }

  // Nitrogen Level Analysis
  if (soilData.nitrogen_level) {
    const n = soilData.nitrogen_level.toLowerCase();
    
    if (n === 'low') {
      insights.push({
        parameter: 'Nitrogen',
        condition: 'Low',
        message: 'Nitrogen is low — apply urea or organic nitrogen sources before sowing.',
        severity: 'warning',
        icon: '🌱',
        recommendations: [
          'Apply 120-150 kg/ha of urea in split doses',
          'Use green manure crops like dhaincha or sunhemp',
          'Apply 15-20 tons/ha of farmyard manure',
          'Consider biofertilizers like Azotobacter',
          'Practice crop rotation with legumes'
        ],
        cropSuitability: ['Legumes first for soil building']
      });
    } else if (n === 'medium' || n === 'moderate') {
      insights.push({
        parameter: 'Nitrogen',
        condition: 'Medium',
        message: 'Nitrogen levels are adequate for most crops.',
        severity: 'success',
        icon: '✅',
        recommendations: [
          'Maintain with balanced fertilization',
          'Apply recommended NPK doses',
          'Monitor crop response'
        ],
        cropSuitability: ['All crops suitable']
      });
    }
  }

  // Phosphorus Level Analysis
  if (soilData.phosphorus_level) {
    const p = soilData.phosphorus_level.toLowerCase();
    
    if (p === 'low') {
      insights.push({
        parameter: 'Phosphorus',
        condition: 'Low',
        message: 'Phosphorus is low — apply single super phosphate or DAP fertilizer.',
        severity: 'warning',
        icon: '📊',
        recommendations: [
          'Apply 60-80 kg/ha of P2O5 through SSP or DAP',
          'Use rock phosphate in acidic soils',
          'Apply phosphorus before sowing',
          'Consider microbial inoculants for phosphorus solubilization'
        ],
        cropSuitability: ['Pulses benefit most from phosphorus']
      });
    }
  }

  // Potassium Level Analysis
  if (soilData.potassium_level) {
    const k = soilData.potassium_level.toLowerCase();
    
    if (k === 'low') {
      insights.push({
        parameter: 'Potassium',
        condition: 'Low',
        message: 'Low potassium — apply muriate of potash to balance nutrients.',
        severity: 'warning',
        icon: '⚡',
        recommendations: [
          'Apply 40-60 kg/ha of K2O through MOP',
          'Use wood ash as organic potassium source',
          'Apply potassium before flowering stage',
          'Important for quality improvement in fruits'
        ],
        cropSuitability: ['Banana', 'Potato', 'Sugarcane', 'Cotton']
      });
    }
  }

  // Bulk Density Analysis
  if (soilData.bulk_density !== null && soilData.bulk_density !== undefined) {
    const bd = soilData.bulk_density;
    
    if (bd > 1.6) {
      insights.push({
        parameter: 'Bulk Density',
        condition: 'High (Compact)',
        message: 'Soil is compact — consider tillage or cover cropping to improve aeration.',
        severity: 'error',
        icon: '🌍',
        recommendations: [
          'Deep ploughing to break hardpan layer',
          'Add organic matter to improve soil structure',
          'Practice minimum tillage with mulching',
          'Use cover crops with deep root systems',
          'Avoid heavy machinery on wet soil'
        ],
        cropSuitability: ['Deep-rooted crops after soil improvement']
      });
    } else if (bd <= 1.3) {
      insights.push({
        parameter: 'Bulk Density',
        condition: 'Optimal',
        message: 'Excellent soil structure for root growth and water infiltration.',
        severity: 'success',
        icon: '✅',
        recommendations: [
          'Maintain with organic matter additions',
          'Avoid soil compaction',
          'Continue good management practices'
        ],
        cropSuitability: ['All crops suitable', 'Deep-rooted crops ideal']
      });
    }
  }

  // If no insights generated, add a default message
  if (insights.length === 0) {
    insights.push({
      parameter: 'Overall',
      condition: 'Insufficient Data',
      message: 'Update soil data to receive AI-powered recommendations.',
      severity: 'info',
      icon: '📊',
      recommendations: [
        'Click "Update Soil Data" to fetch latest information',
        'Ensure land has GPS coordinates for accurate analysis',
        'Regular soil testing recommended every 2-3 years'
      ],
      cropSuitability: []
    });
  }

  return insights;
}

/**
 * Generate a comprehensive soil summary using the insights
 */
export function generateSoilSummary(soilData: {
  ph_level?: number | null;
  organic_carbon?: number | null;
  bulk_density?: number | null;
  nitrogen_level?: string | null;
  phosphorus_level?: string | null;
  potassium_level?: string | null;
  soil_type?: string | null;
}): string {
  const insights = generateSoilInsights(soilData);
  
  // Count severity levels
  const criticalIssues = insights.filter(i => i.severity === 'error').length;
  const warnings = insights.filter(i => i.severity === 'warning').length;
  const goodIndicators = insights.filter(i => i.severity === 'success').length;

  let summary = '';

  // Overall health assessment
  if (criticalIssues > 2) {
    summary = 'This soil requires immediate attention and significant amendments. ';
  } else if (warnings > 2) {
    summary = 'This soil shows moderate deficiencies that should be addressed for optimal crop performance. ';
  } else if (goodIndicators >= 3) {
    summary = 'This soil is in excellent condition with balanced fertility. ';
  } else {
    summary = 'This soil has mixed characteristics requiring targeted improvements. ';
  }

  // Fertility status
  const fertility = [];
  if (soilData.organic_carbon && soilData.organic_carbon > 1.0) {
    fertility.push('high organic matter content');
  } else if (soilData.organic_carbon && soilData.organic_carbon < 0.5) {
    fertility.push('low organic matter requiring urgent enrichment');
  }

  if (soilData.ph_level && soilData.ph_level >= 6.5 && soilData.ph_level <= 7.5) {
    fertility.push('optimal pH range');
  } else if (soilData.ph_level) {
    fertility.push('pH needs adjustment');
  }

  if (fertility.length > 0) {
    summary += `The soil has ${fertility.join(' and ')}. `;
  }

  // Suggested actions
  const primaryActions = insights
    .filter(i => i.severity === 'error' || i.severity === 'warning')
    .slice(0, 2)
    .map(i => i.recommendations[0])
    .join('; ');

  if (primaryActions) {
    summary += `Priority actions: ${primaryActions}. `;
  }

  // Crop suitability
  const suitableCrops = insights
    .filter(i => i.severity === 'success')
    .flatMap(i => i.cropSuitability)
    .slice(0, 5);

  if (suitableCrops.length > 0) {
    summary += `Suitable crops include ${suitableCrops.join(', ')}.`;
  }

  return summary;
}
