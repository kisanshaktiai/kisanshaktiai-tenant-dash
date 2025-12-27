import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Ruler, Droplets, Sprout, Leaf, 
  Eye, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { FarmerLand } from '@/hooks/data/useFarmerLandsRealtime';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ModernLandCardProps {
  land: FarmerLand;
  onView?: (landId: string) => void;
  isHighlighted?: boolean;
}

const getNDVIStatus = (value: number | null) => {
  if (value === null) return { label: 'No Data', color: 'bg-muted text-muted-foreground', status: 'unknown' };
  if (value >= 0.5) return { label: 'Healthy', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', status: 'healthy' };
  if (value >= 0.3) return { label: 'Moderate', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', status: 'moderate' };
  return { label: 'Stressed', color: 'bg-red-500/20 text-red-400 border-red-500/30', status: 'stressed' };
};

const getNDVIGradient = (value: number | null) => {
  if (value === null) return 'from-muted/50 to-muted/30';
  if (value >= 0.5) return 'from-emerald-500/20 to-emerald-600/10';
  if (value >= 0.3) return 'from-amber-500/20 to-amber-600/10';
  return 'from-red-500/20 to-red-600/10';
};

const buildNdviThumbnailCandidates = (raw: string | null): string[] => {
  if (!raw) return [];
  if (raw.startsWith('http')) return [raw];

  const trimmed = raw.replace(/^\//, '');

  // If stored as a full storage path but missing host, prefix it.
  if (trimmed.startsWith('storage/v1/object/public/')) {
    const base = 'https://qfklkkzxemsbeniyugiz.supabase.co';
    return [`${base}/${trimmed}`];
  }

  // Default: interpret as object key inside the ndvi-thumbnails bucket.
  const primary = supabase.storage.from('ndvi-thumbnails').getPublicUrl(trimmed).data.publicUrl;

  // Common legacy format: "thumbnails/ndvi/<id>.png". If the object key is only "<id>.png", fall back.
  const filename = trimmed.split('/').pop();
  const fallback = filename && filename !== trimmed
    ? supabase.storage.from('ndvi-thumbnails').getPublicUrl(filename).data.publicUrl
    : null;

  return [primary, fallback].filter(Boolean) as string[];
};

export const ModernLandCard: React.FC<ModernLandCardProps> = ({ 
  land, 
  onView,
  isHighlighted = false 
}) => {
  const ndviStatus = getNDVIStatus(land.last_ndvi_value);
  const ndviGradient = getNDVIGradient(land.last_ndvi_value);

  const thumbnailCandidates = useMemo(
    () => buildNdviThumbnailCandidates(land.ndvi_thumbnail_url),
    [land.ndvi_thumbnail_url]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`
          relative overflow-hidden cursor-pointer
          border border-border/50 bg-gradient-to-br ${ndviGradient}
          backdrop-blur-xl hover:border-primary/50 transition-all duration-300
          ${isHighlighted ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/20' : ''}
        `}
        onClick={() => onView?.(land.id)}
      >
        {/* NDVI Thumbnail or Gradient Background */}
        <div className="relative h-32 sm:h-40 overflow-hidden">
          {thumbnailCandidates.length > 0 ? (
            <img 
              src={thumbnailCandidates[0]}
              alt={`NDVI map for ${land.name}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                const fallback = thumbnailCandidates[1];
                if (fallback && img.src !== fallback) {
                  img.src = fallback;
                  return;
                }
                img.style.display = 'none';
              }}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${ndviGradient} flex items-center justify-center`}>
              <Leaf className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          {/* NDVI Badge */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant="outline" 
              className={`${ndviStatus.color} backdrop-blur-md font-semibold`}
            >
              {land.last_ndvi_value !== null 
                ? `NDVI: ${land.last_ndvi_value.toFixed(2)}` 
                : 'No NDVI'}
            </Badge>
          </div>

          {/* Crop Badge */}
          {land.current_crop && (
            <div className="absolute top-3 left-3">
              <Badge 
                variant="secondary" 
                className="bg-background/80 backdrop-blur-md"
              >
                <Sprout className="w-3 h-3 mr-1" />
                {land.current_crop}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Land Name & Location */}
          <div>
            <h3 className="font-semibold text-lg text-foreground truncate">
              {land.name || `Plot ${land.survey_number || 'N/A'}`}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {[land.village, land.taluka, land.district].filter(Boolean).join(', ') || 'Location not set'}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Ruler className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Area</p>
                <p className="font-semibold text-sm">{land.area_acres?.toFixed(2)} ac</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Droplets className={`w-4 h-4 ${land.water_source ? 'text-blue-400' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-xs text-muted-foreground">Irrigation</p>
                <p className="font-semibold text-sm truncate">
                  {land.irrigation_source || land.water_source || 'None'}
                </p>
              </div>
            </div>
          </div>

          {/* Crop Stage & Health Indicators */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              {land.crop_stage && (
                <Badge variant="outline" className="text-xs">
                  {land.crop_stage}
                </Badge>
              )}
              {land.soil_type && (
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
                  {land.soil_type}
                </Badge>
              )}
            </div>
            
            {/* NDVI Date */}
            {land.last_ndvi_calculation && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(land.last_ndvi_calculation), 'MMM dd')}
              </span>
            )}
          </div>

          {/* View Details Button */}
          <button 
            className="w-full mt-2 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 
              text-primary text-sm font-medium transition-colors flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(land.id);
            }}
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
