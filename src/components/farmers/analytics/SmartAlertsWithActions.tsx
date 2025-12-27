import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, CheckCircle2, AlertCircle, Bell,
  MessageSquare, Phone, Mail, Send, Zap, Droplets,
  Leaf, TrendingDown, Thermometer, Bug, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SmartAlert {
  id: string;
  type: 'soil' | 'ndvi' | 'weather' | 'crop';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
  dataPoint?: string;
  createdAt: Date;
}

interface SmartAlertsWithActionsProps {
  soilData: any[];
  ndviData: any[];
  farmerPhone?: string | null;
  farmerName: string;
  onContactAction?: (method: 'sms' | 'whatsapp' | 'call' | 'email', alertContext: string) => void;
}

const generateAlertsFromData = (soilData: any[], ndviData: any[]): SmartAlert[] => {
  const alerts: SmartAlert[] = [];
  const now = new Date();

  // Analyze soil data
  if (soilData.length > 0) {
    const latestSoil = soilData[0];
    
    // pH alerts
    if (latestSoil.ph_level !== null) {
      if (latestSoil.ph_level < 5.5) {
        alerts.push({
          id: 'ph-low',
          type: 'soil',
          severity: 'critical',
          title: 'Critically Low Soil pH',
          description: `pH level is ${latestSoil.ph_level?.toFixed(1)}, which is too acidic for most crops.`,
          recommendation: 'Apply agricultural lime (2-4 tonnes/ha) to raise pH. Consider soil buffering test.',
          dataPoint: `pH: ${latestSoil.ph_level?.toFixed(1)}`,
          createdAt: now,
        });
      } else if (latestSoil.ph_level > 8.0) {
        alerts.push({
          id: 'ph-high',
          type: 'soil',
          severity: 'warning',
          title: 'High Soil pH Detected',
          description: `pH level is ${latestSoil.ph_level?.toFixed(1)}, which may limit nutrient availability.`,
          recommendation: 'Apply elemental sulfur or acidifying fertilizers to lower pH gradually.',
          dataPoint: `pH: ${latestSoil.ph_level?.toFixed(1)}`,
          createdAt: now,
        });
      }
    }

    // Nitrogen alerts
    if (latestSoil.nitrogen_kg_per_ha !== null && latestSoil.nitrogen_kg_per_ha < 280) {
      alerts.push({
        id: 'nitrogen-low',
        type: 'soil',
        severity: latestSoil.nitrogen_kg_per_ha < 200 ? 'critical' : 'warning',
        title: 'Nitrogen Deficiency',
        description: `Nitrogen level (${latestSoil.nitrogen_kg_per_ha?.toFixed(0)} kg/ha) is below optimal for crop growth.`,
        recommendation: 'Apply urea (46-0-0) or ammonium sulfate. Consider split application.',
        dataPoint: `N: ${latestSoil.nitrogen_kg_per_ha?.toFixed(0)} kg/ha`,
        createdAt: now,
      });
    }

    // Phosphorus alerts
    if (latestSoil.phosphorus_kg_per_ha !== null && latestSoil.phosphorus_kg_per_ha < 11) {
      alerts.push({
        id: 'phosphorus-low',
        type: 'soil',
        severity: 'warning',
        title: 'Low Phosphorus Level',
        description: `Phosphorus is at ${latestSoil.phosphorus_kg_per_ha?.toFixed(0)} kg/ha, affecting root development.`,
        recommendation: 'Apply DAP or SSP fertilizer before planting. Phosphorus uptake improves with mycorrhizal inoculants.',
        dataPoint: `P: ${latestSoil.phosphorus_kg_per_ha?.toFixed(0)} kg/ha`,
        createdAt: now,
      });
    }

    // Potassium alerts
    if (latestSoil.potassium_kg_per_ha !== null && latestSoil.potassium_kg_per_ha < 110) {
      alerts.push({
        id: 'potassium-low',
        type: 'soil',
        severity: 'warning',
        title: 'Potassium Deficiency',
        description: `Potassium at ${latestSoil.potassium_kg_per_ha?.toFixed(0)} kg/ha may reduce fruit quality and disease resistance.`,
        recommendation: 'Apply MOP (Muriate of Potash) or SOP for sensitive crops.',
        dataPoint: `K: ${latestSoil.potassium_kg_per_ha?.toFixed(0)} kg/ha`,
        createdAt: now,
      });
    }

    // Organic carbon alerts
    if (latestSoil.organic_carbon !== null && latestSoil.organic_carbon < 0.5) {
      alerts.push({
        id: 'oc-low',
        type: 'soil',
        severity: 'warning',
        title: 'Low Organic Carbon',
        description: `Organic carbon (${latestSoil.organic_carbon?.toFixed(2)}%) indicates poor soil health.`,
        recommendation: 'Add compost, FYM, or green manure. Practice crop residue incorporation.',
        dataPoint: `OC: ${latestSoil.organic_carbon?.toFixed(2)}%`,
        createdAt: now,
      });
    }
  }

  // Analyze NDVI data
  if (ndviData.length > 0) {
    const latestNdvi = ndviData[0];
    const ndviValue = latestNdvi.ndvi_value ?? latestNdvi.ndvi;
    
    if (ndviValue !== null && ndviValue !== undefined) {
      if (ndviValue < 0.3) {
        alerts.push({
          id: 'ndvi-critical',
          type: 'ndvi',
          severity: 'critical',
          title: 'Vegetation Stress Detected',
          description: `NDVI of ${ndviValue.toFixed(3)} indicates severe vegetation stress or sparse coverage.`,
          recommendation: 'Immediate field inspection needed. Check for pest infestation, water stress, or disease.',
          dataPoint: `NDVI: ${ndviValue.toFixed(3)}`,
          createdAt: now,
        });
      } else if (ndviValue < 0.5) {
        alerts.push({
          id: 'ndvi-warning',
          type: 'ndvi',
          severity: 'warning',
          title: 'Moderate Vegetation Health',
          description: `NDVI of ${ndviValue.toFixed(3)} suggests crop may need attention.`,
          recommendation: 'Monitor crop closely. Ensure adequate irrigation and nutrient availability.',
          dataPoint: `NDVI: ${ndviValue.toFixed(3)}`,
          createdAt: now,
        });
      }
    }

    // Check for declining NDVI trend
    if (ndviData.length >= 3) {
      const recent = ndviData.slice(0, 3).map(n => n.ndvi_value ?? n.ndvi ?? 0);
      if (recent[0] < recent[1] && recent[1] < recent[2]) {
        alerts.push({
          id: 'ndvi-declining',
          type: 'ndvi',
          severity: 'warning',
          title: 'Declining Vegetation Trend',
          description: 'NDVI has been declining over the last 3 observations.',
          recommendation: 'Investigate cause of decline. Consider irrigation adjustment or pest inspection.',
          dataPoint: `Trend: ${recent[2]?.toFixed(2)} → ${recent[0]?.toFixed(2)}`,
          createdAt: now,
        });
      }
    }
  }

  // Add positive alerts if everything is good
  if (alerts.length === 0 && (soilData.length > 0 || ndviData.length > 0)) {
    alerts.push({
      id: 'all-good',
      type: 'crop',
      severity: 'info',
      title: 'All Systems Healthy',
      description: 'Soil and vegetation parameters are within optimal ranges.',
      recommendation: 'Continue current practices. Schedule next soil test in 6 months.',
      createdAt: now,
    });
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
};

const getSeverityStyles = (severity: SmartAlert['severity']) => {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-destructive/10 border-destructive/30',
        icon: 'bg-destructive/20 text-destructive',
        badge: 'bg-destructive text-destructive-foreground',
      };
    case 'warning':
      return {
        bg: 'bg-amber-500/10 border-amber-500/30',
        icon: 'bg-amber-500/20 text-amber-500',
        badge: 'bg-amber-500 text-white',
      };
    case 'info':
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        icon: 'bg-emerald-500/20 text-emerald-500',
        badge: 'bg-emerald-500 text-white',
      };
  }
};

const getAlertIcon = (type: SmartAlert['type']) => {
  switch (type) {
    case 'soil': return Droplets;
    case 'ndvi': return Leaf;
    case 'weather': return Thermometer;
    case 'crop': return CheckCircle2;
    default: return AlertCircle;
  }
};

export const SmartAlertsWithActions: React.FC<SmartAlertsWithActionsProps> = ({
  soilData,
  ndviData,
  farmerPhone,
  farmerName,
  onContactAction,
}) => {
  const alerts = generateAlertsFromData(soilData, ndviData);
  
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  const handleContact = (method: 'sms' | 'whatsapp' | 'call' | 'email', alert: SmartAlert) => {
    const context = `Alert: ${alert.title}\n${alert.description}\nRecommendation: ${alert.recommendation}`;
    onContactAction?.(method, context);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Alert Summary Header */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/5 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              Smart Alerts & Actions
            </CardTitle>
            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {criticalCount} Critical
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge className="bg-amber-500 text-white gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {warningCount} Warning
                </Badge>
              )}
              {criticalCount === 0 && warningCount === 0 && (
                <Badge className="bg-emerald-500 text-white gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  All Good
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            AI-powered analysis of soil health and vegetation data for <span className="font-medium text-foreground">{farmerName}</span>
          </p>
          
          {/* Quick Contact Actions */}
          {(criticalCount > 0 || warningCount > 0) && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
              <span className="text-sm font-medium mr-2">Quick Contact:</span>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/50"
                onClick={() => onContactAction?.('whatsapp', alerts.map(a => a.title).join(', '))}
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/50"
                onClick={() => onContactAction?.('sms', alerts.map(a => a.title).join(', '))}
              >
                <Send className="w-4 h-4" />
                SMS
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2 hover:bg-purple-500/10 hover:text-purple-500 hover:border-purple-500/50"
                onClick={() => onContactAction?.('call', alerts.map(a => a.title).join(', '))}
              >
                <Phone className="w-4 h-4" />
                Call
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/50"
                onClick={() => onContactAction?.('email', alerts.map(a => a.title).join(', '))}
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert List */}
      <div className="space-y-3">
        <AnimatePresence>
          {alerts.map((alert, idx) => {
            const styles = getSeverityStyles(alert.severity);
            const Icon = getAlertIcon(alert.type);
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={cn("border overflow-hidden", styles.bg)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn("p-3 rounded-xl shrink-0", styles.icon)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                          </div>
                          <Badge className={cn("shrink-0", styles.badge)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        
                        {/* Recommendation */}
                        <div className="mt-3 p-3 rounded-lg bg-background/50 border border-border/50">
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-medium text-amber-500">Recommended Action</span>
                          </div>
                          <p className="text-sm">{alert.recommendation}</p>
                        </div>
                        
                        {/* Data Point & Actions */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            {alert.dataPoint && (
                              <Badge variant="outline" className="text-xs">
                                {alert.dataPoint}
                              </Badge>
                            )}
                          </div>
                          
                          {alert.severity !== 'info' && (
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-8 px-3 text-xs gap-1"
                                onClick={() => handleContact('whatsapp', alert)}
                              >
                                <MessageSquare className="w-3 h-3" />
                                Notify
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-8 px-3 text-xs gap-1"
                                onClick={() => handleContact('sms', alert)}
                              >
                                <Send className="w-3 h-3" />
                                SMS
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
