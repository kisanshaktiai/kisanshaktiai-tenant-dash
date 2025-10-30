import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LandWithSoilHealth } from '@/hooks/data/useRealtimeSoilData';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Clock, TrendingUp } from 'lucide-react';

interface SoilHealthTimelineProps {
  lands: LandWithSoilHealth[];
}

export const SoilHealthTimeline = ({ lands }: SoilHealthTimelineProps) => {
  const timelineData = useMemo(() => {
    const updates = lands
      .filter(land => land.soil_health && land.soil_health.length > 0)
      .map(land => ({
        land,
        latestUpdate: new Date(land.updated_at),
        hasIssues: land.soil_health.some(sh => 
          (sh.nitrogen_kg_per_ha !== null && sh.nitrogen_kg_per_ha < 200) ||
          (sh.phosphorus_kg_per_ha !== null && sh.phosphorus_kg_per_ha < 10) ||
          (sh.potassium_kg_per_ha !== null && sh.potassium_kg_per_ha < 100)
        )
      }))
      .sort((a, b) => b.latestUpdate.getTime() - a.latestUpdate.getTime())
      .slice(0, 10);

    return updates;
  }, [lands]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Soil Data Updates
        </CardTitle>
        <CardDescription>Latest 10 updates across all lands</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent updates</p>
          ) : (
            timelineData.map((item, index) => (
              <div
                key={item.land.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0"
              >
                <div className="flex-shrink-0 w-16 text-sm text-muted-foreground">
                  {format(item.latestUpdate, 'MMM dd')}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{item.land.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.land.farmer?.farmer_name} • {item.land.village}, {item.land.district}
                      </p>
                    </div>
                    {item.hasIssues ? (
                      <Badge variant="destructive">Needs Attention</Badge>
                    ) : (
                      <Badge variant="secondary">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Healthy
                      </Badge>
                    )}
                  </div>
                  {item.land.soil_health[0] && (
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        N: {item.land.soil_health[0].nitrogen_kg_per_ha?.toFixed(1) || 'N/A'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        P: {item.land.soil_health[0].phosphorus_kg_per_ha?.toFixed(1) || 'N/A'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        K: {item.land.soil_health[0].potassium_kg_per_ha?.toFixed(1) || 'N/A'}
                      </Badge>
                      {item.land.soil_health[0].ph_level && (
                        <Badge variant="outline" className="text-xs">
                          pH: {item.land.soil_health[0].ph_level.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
