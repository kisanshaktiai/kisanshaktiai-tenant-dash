
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function CommunicationTools() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Communication Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Communication Tools</h3>
          <p className="text-muted-foreground">
            Messaging, announcements, and document sharing tools coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
