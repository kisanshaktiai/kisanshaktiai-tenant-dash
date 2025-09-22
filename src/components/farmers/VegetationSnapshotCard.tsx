import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, Leaf, Droplets, TreePine, Sprout, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNDVIData } from '@/hooks/data/useNDVIData';

interface VegetationSnapshotCardProps {
  farmerId: string;
  onClick?: () => void;
}

const IndexTooltips = {
  ndvi: {
    title: 'NDVI - Normalized Difference Vegetation Index',
    description: 'Measures crop greenness and health. Higher values (0.6-0.9) indicate healthy, dense vegetation.',
    icon: Leaf,
    color: 'text-green-600'
  },
  evi: {
    title: 'EVI - Enhanced Vegetation Index',
    description: 'Similar to NDVI but better for areas with high biomass. Reduces atmospheric influences.',
    icon: TreePine,
    color: 'text-emerald-600'
  },
  ndwi: {
    title: 'NDWI - Normalized Difference Water Index',
    description: 'Measures water content in vegetation. Higher values indicate better hydration.',
    icon: Droplets,
    color: 'text-blue-600'
  },
  savi: {
    title: 'SAVI - Soil Adjusted Vegetation Index',
    description: 'Accounts for soil brightness in sparse vegetation areas. Better for early growth stages.',
    icon: Sprout,
    color: 'text-amber-600'
  }
};

const getIndexColor = (value: number, type: 'ndvi' | 'evi' | 'ndwi' | 'savi') => {
  if (type === 'ndwi') {
    // NDWI can be negative for dry areas
    if (value < 0) return 'text-red-600';
    if (value < 0.2) return 'text-orange-600';
    if (value < 0.4) return 'text-yellow-600';
    return 'text-green-600';
  }
  
  // For NDVI, EVI, SAVI
  if (value < 0.3) return 'text-red-600';
  if (value < 0.5) return 'text-orange-600';
  if (value < 0.7) return 'text-yellow-600';
  return 'text-green-600';
};

const getHealthStatus = (ndvi: number): { label: string; color: string } => {
  if (ndvi >= 0.7) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
  if (ndvi >= 0.5) return { label: 'Good', color: 'bg-emerald-100 text-emerald-800' };
  if (ndvi >= 0.3) return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' };
  return { label: 'Poor', color: 'bg-red-100 text-red-800' };
};

export const VegetationSnapshotCard: React.FC<VegetationSnapshotCardProps> = ({ 
  farmerId, 
  onClick 
}) => {
  const { data: snapshot, isLoading, error } = useNDVIData(farmerId);

  if (isLoading) {
    return (
      <div className="mt-2 p-3 bg-muted/30 rounded-lg space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !snapshot) {
    return null; // Don't show if no data available
  }

  const healthStatus = getHealthStatus(snapshot.ndvi);
  const TrendIcon = snapshot.trend === 'up' ? TrendingUp : 
                    snapshot.trend === 'down' ? TrendingDown : Minus;

  return (
    <TooltipProvider>
      <div 
        className="mt-2 p-3 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/30 dark:border-green-800/30 cursor-pointer hover:shadow-md transition-all"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold">Vegetation Health</span>
            <Badge className={cn("text-xs", healthStatus.color)}>
              {healthStatus.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <TrendIcon className={cn(
              "w-3 h-3",
              snapshot.trend === 'up' ? 'text-green-600' : 
              snapshot.trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            )} />
            <span className="text-xs text-muted-foreground">
              {new Date(snapshot.capturedDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Indices Grid */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {Object.entries({
            ndvi: snapshot.ndvi,
            evi: snapshot.evi,
            ndwi: snapshot.ndwi,
            savi: snapshot.savi
          }).map(([key, value]) => {
            const info = IndexTooltips[key as keyof typeof IndexTooltips];
            const Icon = info.icon;
            
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <div className="bg-background/60 rounded-md p-2 text-center hover:bg-background/80 transition-colors">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Icon className={cn("w-3 h-3", info.color)} />
                      <span className="text-[10px] font-medium uppercase">{key}</span>
                      <HelpCircle className="w-2.5 h-2.5 text-muted-foreground" />
                    </div>
                    <div className={cn(
                      "text-sm font-bold",
                      getIndexColor(value, key as any)
                    )}>
                      {value.toFixed(2)}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{info.title}</p>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Preview Image */}
        {snapshot.imageUrl && (
          <div className="relative h-20 rounded-md overflow-hidden bg-muted">
            <img 
              src={snapshot.imageUrl} 
              alt="Vegetation heatmap"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <span className="absolute bottom-1 right-1 text-[10px] text-white/90 bg-black/50 px-1 rounded">
              Click to view trends
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};