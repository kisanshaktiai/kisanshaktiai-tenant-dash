
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export default function TerritoryManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Territory Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Territory Management</h3>
          <p className="text-muted-foreground">
            Visual territory mapping and coverage analysis coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
