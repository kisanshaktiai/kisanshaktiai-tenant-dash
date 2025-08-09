
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CampaignsPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="text-muted-foreground">Manage your marketing campaigns</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Campaigns Module</CardTitle>
          <CardDescription>Campaign management features coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This module will include campaign creation, management, and analytics.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignsPage;
