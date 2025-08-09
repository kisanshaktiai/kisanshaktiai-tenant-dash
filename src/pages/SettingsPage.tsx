
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Settings Module</CardTitle>
          <CardDescription>Settings and configuration options</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This module will include account settings, preferences, and configuration options.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
