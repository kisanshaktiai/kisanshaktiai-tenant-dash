import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, Ruler, Droplets, Leaf, TreePine, Mountain,
  Wheat, Sun, Calendar, ExternalLink, Eye, Grid3X3,
  LayoutGrid, List, TrendingUp, TrendingDown, Minus,
  Layers, Navigation, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface LandParcel {
  id: string;
  name?: string;
  area_acres: number;
  area_guntas?: number;
  soil_type?: string;
  irrigation_type?: string;
  water_source?: string;
  current_crop?: string;
  crop_stage?: string;
  village?: string;
  district?: string;
  state?: string;
  center_lat?: number;
  center_lon?: number;
  ndvi_thumbnail_url?: string;
  last_ndvi_value?: number;
  last_ndvi_calculation?: string;
  soil_ph?: number;
  elevation_meters?: number;
  slope_percentage?: number;
  planting_date?: string;
  expected_harvest_date?: string;
  is_active?: boolean;
  location?: any;
  crops?: string[];
}

interface ModernLandsAnalyticsProps {
  lands: LandParcel[];
  onLandSelect?: (landId: string) => void;
}

const getNdviStatus = (value: number | null | undefined): { 
  label: string; 
  color: string; 
  bgColor: string;
} => {
  if (!value && value !== 0) return { label: 'No Data', color: 'text-muted-foreground', bgColor: 'bg-muted/50' };
  if (value >= 0.7) return { label: 'Excellent', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' };
  if (value >= 0.5) return { label: 'Good', color: 'text-green-400', bgColor: 'bg-green-500/20' };
  if (value >= 0.3) return { label: 'Moderate', color: 'text-amber-400', bgColor: 'bg-amber-500/20' };
  return { label: 'Stressed', color: 'text-red-400', bgColor: 'bg-red-500/20' };
};

const getSoilColor = (type: string | null | undefined): string => {
  const colors: Record<string, string> = {
    'black': 'bg-slate-700',
    'red': 'bg-red-700',
    'alluvial': 'bg-amber-600',
    'clay': 'bg-orange-700',
    'sandy': 'bg-yellow-600',
    'loamy': 'bg-lime-700',
  };
  return colors[type?.toLowerCase() || ''] || 'bg-muted';
};

// Helper to build proper NDVI thumbnail URL
const getNdviThumbnailUrl = (url: string | null | undefined, landId: string): string | null => {
  if (!url) return null;
  
  // If it's already a full URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path, build the full Supabase storage URL
  const supabaseUrl = 'https://qfklkkzxemsbeniyugiz.supabase.co';
  
  // Handle /thumbnails/ndvi/ format
  if (url.startsWith('/thumbnails/ndvi/')) {
    return `${supabaseUrl}/storage/v1/object/public/ndvi-thumbnails/${landId}.png`;
  }
  
  // Handle other relative paths
  if (url.startsWith('/')) {
    return `${supabaseUrl}/storage/v1/object/public${url}`;
  }
  
  return url;
};

// Generate a static map preview URL using OpenStreetMap tiles
const getMapPreviewUrl = (lat?: number, lon?: number, zoom: number = 15): string => {
  if (!lat || !lon) return '';
  // Use a free tile service for static map preview
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lon},${lat},${zoom},0/300x200?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
};

export const ModernLandsAnalytics: React.FC<ModernLandsAnalyticsProps> = ({
  lands,
  onLandSelect,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [selectedLand, setSelectedLand] = useState<string | null>(null);
  const [showMapInput, setShowMapInput] = useState(false);

  // Helper to get land name or fallback
  const getLandName = (land: LandParcel, idx: number) => land.name || `Plot ${idx + 1}`;
  const getLandCrop = (land: LandParcel) => land.current_crop || land.crops?.join(', ') || null;
  
  // Calculate summary stats
  const totalArea = lands.reduce((sum, l) => sum + (l.area_acres || 0), 0);
  const avgNdvi = lands.filter(l => l.last_ndvi_value).reduce((sum, l) => sum + (l.last_ndvi_value || 0), 0) / 
    (lands.filter(l => l.last_ndvi_value).length || 1);
  const uniqueCrops = [...new Set(lands.map(l => getLandCrop(l)).filter(Boolean))];
  const landsWithCoords = lands.filter(l => l.center_lat && l.center_lon);

  if (lands.length === 0) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-emerald-500/5">
        <CardContent className="p-8 text-center">
          <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Land Parcels</h3>
          <p className="text-sm text-muted-foreground">
            Land parcels will appear here once added to the farmer's profile
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">Total Parcels</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">{lands.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {landsWithCoords.length} with GPS
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-muted-foreground">Total Area</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{totalArea.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">acres</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-muted-foreground">Avg NDVI</span>
            </div>
            <p className="text-3xl font-bold text-amber-400">{avgNdvi.toFixed(2)}</p>
            <Badge 
              variant="outline" 
              className={cn("mt-1 text-xs", getNdviStatus(avgNdvi).color)}
            >
              {getNdviStatus(avgNdvi).label}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wheat className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-muted-foreground">Crops</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">{uniqueCrops.length}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {uniqueCrops.slice(0, 2).join(', ') || 'None'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle & Header */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              Land Parcels Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {/* Grid View */}
            {viewMode === 'grid' && (
              <motion.div
                key="grid"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {lands.map((land, idx) => {
                  const ndviStatus = getNdviStatus(land.last_ndvi_value);
                  const thumbnailUrl = getNdviThumbnailUrl(land.ndvi_thumbnail_url, land.id);
                  
                  return (
                    <motion.div
                      key={land.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card 
                        className={cn(
                          "border-border/50 overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg",
                          selectedLand === land.id && "ring-2 ring-primary"
                        )}
                        onClick={() => {
                          setSelectedLand(land.id === selectedLand ? null : land.id);
                          onLandSelect?.(land.id);
                        }}
                      >
                        {/* Thumbnail */}
                        <div className="relative h-40 bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                          {thumbnailUrl ? (
                            <img 
                              src={thumbnailUrl}
                              alt={getLandName(land, idx)}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : land.center_lat && land.center_lon ? (
                            <div className="w-full h-full relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 via-green-500/20 to-blue-500/30 flex items-center justify-center">
                                <div className="text-center">
                                  <MapPin className="w-8 h-8 text-white/70 mx-auto mb-1" />
                                  <p className="text-xs text-white/70 font-medium">
                                    {land.center_lat?.toFixed(4)}, {land.center_lon?.toFixed(4)}
                                  </p>
                                </div>
                              </div>
                              {/* Grid overlay for map effect */}
                              <div className="absolute inset-0 opacity-20">
                                <svg className="w-full h-full">
                                  <defs>
                                    <pattern id={`grid-${land.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                                    </pattern>
                                  </defs>
                                  <rect width="100%" height="100%" fill={`url(#grid-${land.id})`} />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <TreePine className="w-12 h-12 text-muted-foreground/30" />
                            </div>
                          )}
                          
                          {/* Overlay badges */}
                          <div className="absolute top-2 left-2 flex gap-1">
                            <Badge className="bg-background/80 backdrop-blur-md text-foreground">
                              {land.area_acres?.toFixed(2)} ac
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2">
                            {land.last_ndvi_value !== undefined && land.last_ndvi_value !== null && (
                              <Badge className={cn("backdrop-blur-md", ndviStatus.bgColor, ndviStatus.color)}>
                                NDVI: {land.last_ndvi_value.toFixed(2)}
                              </Badge>
                            )}
                          </div>
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background to-transparent h-16" />
                        </div>

                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-foreground">{getLandName(land, idx)}</h4>
                              {land.village && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {land.village}{land.district ? `, ${land.district}` : ''}
                                </p>
                              )}
                            </div>
                            {land.is_active !== false && (
                              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                Active
                              </Badge>
                            )}
                          </div>

                          {/* Quick Info Grid */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {getLandCrop(land) && (
                              <div className="flex items-center gap-2">
                                <Wheat className="w-4 h-4 text-amber-400" />
                                <span className="text-muted-foreground truncate">{getLandCrop(land)}</span>
                              </div>
                            )}
                            {land.soil_type && (
                              <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded-full", getSoilColor(land.soil_type))} />
                                <span className="text-muted-foreground capitalize truncate">{land.soil_type}</span>
                              </div>
                            )}
                            {land.irrigation_type && (
                              <div className="flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-blue-400" />
                                <span className="text-muted-foreground truncate">{land.irrigation_type}</span>
                              </div>
                            )}
                            {land.crop_stage && (
                              <div className="flex items-center gap-2">
                                <Sun className="w-4 h-4 text-orange-400" />
                                <span className="text-muted-foreground capitalize truncate">{land.crop_stage}</span>
                              </div>
                            )}
                          </div>

                          {/* NDVI Progress */}
                          {land.last_ndvi_value !== undefined && land.last_ndvi_value !== null && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Vegetation Health</span>
                                <span className={ndviStatus.color}>{ndviStatus.label}</span>
                              </div>
                              <Progress 
                                value={land.last_ndvi_value * 100} 
                                className="h-2"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {lands.map((land, idx) => {
                  const ndviStatus = getNdviStatus(land.last_ndvi_value);
                  const thumbnailUrl = getNdviThumbnailUrl(land.ndvi_thumbnail_url, land.id);
                  
                  return (
                    <motion.div
                      key={land.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer",
                        selectedLand === land.id && "ring-2 ring-primary"
                      )}
                      onClick={() => {
                        setSelectedLand(land.id === selectedLand ? null : land.id);
                        onLandSelect?.(land.id);
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                        {thumbnailUrl ? (
                          <img 
                            src={thumbnailUrl}
                            alt={getLandName(land, idx)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TreePine className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{getLandName(land, idx)}</h4>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {land.area_acres?.toFixed(2)} ac
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {getLandCrop(land) && (
                            <span className="flex items-center gap-1">
                              <Wheat className="w-3 h-3" />
                              {getLandCrop(land)}
                            </span>
                          )}
                          {land.soil_type && (
                            <span className="flex items-center gap-1">
                              <div className={cn("w-2 h-2 rounded-full", getSoilColor(land.soil_type))} />
                              {land.soil_type}
                            </span>
                          )}
                          {land.village && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {land.village}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* NDVI Status */}
                      <div className="text-right shrink-0">
                        {land.last_ndvi_value !== undefined && land.last_ndvi_value !== null ? (
                          <>
                            <p className={cn("text-lg font-bold", ndviStatus.color)}>
                              {land.last_ndvi_value.toFixed(2)}
                            </p>
                            <Badge variant="outline" className={cn("text-xs", ndviStatus.color)}>
                              {ndviStatus.label}
                            </Badge>
                          </>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            No NDVI
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Map View */}
            {viewMode === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {landsWithCoords.length > 0 ? (
                  <div className="space-y-4">
                    {/* Map placeholder with land markers */}
                    <div className="relative h-80 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-900/20 via-blue-900/30 to-slate-900/40 border border-border/50">
                      {/* Grid overlay */}
                      <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full">
                          <defs>
                            <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#map-grid)" />
                        </svg>
                      </div>
                      
                      {/* Simulated markers */}
                      <div className="absolute inset-0 p-4">
                        <div className="relative w-full h-full">
                          {landsWithCoords.slice(0, 6).map((land, idx) => {
                            // Position markers in a pseudo-random but deterministic pattern
                            const left = 15 + (idx % 3) * 30 + (Math.sin(idx) * 10);
                            const top = 20 + Math.floor(idx / 3) * 40 + (Math.cos(idx) * 10);
                            const ndviStatus = getNdviStatus(land.last_ndvi_value);
                            
                            return (
                              <motion.div
                                key={land.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: idx * 0.1, type: 'spring' }}
                                className="absolute cursor-pointer group"
                                style={{ left: `${left}%`, top: `${top}%` }}
                                onClick={() => setSelectedLand(land.id)}
                              >
                                <div className={cn(
                                  "relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-transform group-hover:scale-110",
                                  selectedLand === land.id ? "border-primary ring-2 ring-primary/50" : "border-white/50"
                                )}>
                                  {land.ndvi_thumbnail_url ? (
                                    <img 
                                      src={land.ndvi_thumbnail_url}
                                      alt={getLandName(land, idx)}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className={cn("w-full h-full flex items-center justify-center", ndviStatus.bgColor)}>
                                      <Leaf className={cn("w-5 h-5", ndviStatus.color)} />
                                    </div>
                                  )}
                                </div>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <div className="bg-background/95 backdrop-blur-md rounded-lg p-2 shadow-lg border border-border/50 whitespace-nowrap">
                                    <p className="font-medium text-sm">{getLandName(land, idx)}</p>
                                    <p className="text-xs text-muted-foreground">{land.area_acres?.toFixed(2)} ac</p>
                                  </div>
                                </div>
                                {/* Ping animation */}
                                <div className="absolute inset-0 rounded-lg animate-ping opacity-20 bg-primary" 
                                  style={{ animationDuration: '2s', animationIterationCount: selectedLand === land.id ? 'infinite' : 0 }} 
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Map legend */}
                      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-md rounded-lg p-3 border border-border/50">
                        <p className="text-xs font-medium mb-2">Land Parcels</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-emerald-500/50" />
                            Healthy
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-amber-500/50" />
                            Moderate
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-red-500/50" />
                            Stressed
                          </span>
                        </div>
                      </div>

                      {/* Coordinates display */}
                      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md rounded-lg px-3 py-2 border border-border/50">
                        <p className="text-xs text-muted-foreground font-mono">
                          {landsWithCoords.length} parcels mapped
                        </p>
                      </div>
                    </div>

                    {/* Selected land details */}
                    {selectedLand && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {(() => {
                          const land = lands.find(l => l.id === selectedLand);
                          if (!land) return null;
                          const ndviStatus = getNdviStatus(land.last_ndvi_value);
                          
                          return (
                            <Card className="border-primary/50 bg-primary/5">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                                    {land.ndvi_thumbnail_url ? (
                                      <img 
                                        src={land.ndvi_thumbnail_url}
                                        alt={land.name || 'Land parcel'}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                                        <TreePine className="w-10 h-10 text-muted-foreground/30" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-lg font-semibold">{land.name || `Plot ${lands.findIndex(l => l.id === land.id) + 1}`}</h4>
                                      <Badge className={cn("text-xs", ndviStatus.bgColor, ndviStatus.color)}>
                                        NDVI: {land.last_ndvi_value?.toFixed(2) || 'N/A'}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <p className="text-muted-foreground text-xs">Area</p>
                                        <p className="font-medium">{land.area_acres?.toFixed(2)} ac</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground text-xs">Crop</p>
                                        <p className="font-medium">{land.current_crop || land.crops?.join(', ') || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground text-xs">Soil</p>
                                        <p className="font-medium capitalize">{land.soil_type || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground text-xs">Coordinates</p>
                                        <p className="font-medium font-mono text-xs">
                                          {land.center_lat?.toFixed(4)}, {land.center_lon?.toFixed(4)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })()}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border/50">
                    <div className="text-center">
                      <Navigation className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">No GPS Data Available</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Land parcels need GPS coordinates for map view
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
