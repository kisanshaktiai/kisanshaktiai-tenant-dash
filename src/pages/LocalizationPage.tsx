import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { 
  Globe, 
  Clock, 
  Calendar,
  DollarSign,
  Languages,
  MapPin,
  Save,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LocalizationPage = () => {
  const { toast } = useToast();
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [currency, setCurrency] = useState('INR');

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your localization preferences have been updated.",
    });
  };

  const supportedLanguages = [
    { code: 'en', name: 'English', native: 'English', status: 'complete' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी', status: 'complete' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', status: 'partial' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', status: 'partial' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', status: 'partial' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം', status: 'partial' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', status: 'coming' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', status: 'coming' }
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Localization Settings"
        description="Configure language, region, and display preferences"
      />

      <PageContent className="space-y-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Language Preferences
            </CardTitle>
            <CardDescription>
              Select your preferred language for the interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Primary Language</Label>
                <select 
                  className="w-full mt-2 p-2 border rounded-md"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {supportedLanguages.filter(lang => lang.status !== 'coming').map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.native})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Available Languages</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {supportedLanguages.map(lang => (
                    <div key={lang.code} className="p-3 border rounded-lg">
                      <p className="font-medium">{lang.native}</p>
                      <p className="text-sm text-muted-foreground">{lang.name}</p>
                      {lang.status === 'complete' && <Badge variant="secondary" className="mt-2">Available</Badge>}
                      {lang.status === 'partial' && <Badge variant="outline" className="mt-2">Partial</Badge>}
                      {lang.status === 'coming' && <Badge variant="outline" className="mt-2">Coming Soon</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Regional Settings
            </CardTitle>
            <CardDescription>
              Configure your timezone and regional preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Timezone</Label>
              <select 
                className="w-full mt-2 p-2 border rounded-md"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                <option value="Europe/London">British Summer Time (BST)</option>
                <option value="America/New_York">Eastern Standard Time (EST)</option>
                <option value="America/Los_Angeles">Pacific Standard Time (PST)</option>
              </select>
              <p className="text-sm text-muted-foreground mt-1">
                Current time: {new Date().toLocaleTimeString('en-US', { timeZone: timezone, hour12: true })}
              </p>
            </div>

            <div>
              <Label>Country/Region</Label>
              <select className="w-full mt-2 p-2 border rounded-md">
                <option>India</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Australia</option>
                <option>Canada</option>
              </select>
            </div>

            <div>
              <Label>State/Province</Label>
              <select className="w-full mt-2 p-2 border rounded-md">
                <option>Maharashtra</option>
                <option>Karnataka</option>
                <option>Tamil Nadu</option>
                <option>Gujarat</option>
                <option>Punjab</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Format Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Format Settings</CardTitle>
            <CardDescription>
              Customize how dates, times, and numbers are displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Format
              </Label>
              <select 
                className="w-full mt-2 p-2 border rounded-md"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
                <option value="DD-MMM-YYYY">DD-MMM-YYYY (31-Dec-2025)</option>
              </select>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Format
              </Label>
              <select className="w-full mt-2 p-2 border rounded-md">
                <option>12-hour (1:30 PM)</option>
                <option>24-hour (13:30)</option>
              </select>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Currency
              </Label>
              <select 
                className="w-full mt-2 p-2 border rounded-md"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>

            <div>
              <Label>Number Format</Label>
              <select className="w-full mt-2 p-2 border rounded-md">
                <option>1,00,000.00 (Indian)</option>
                <option>100,000.00 (International)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default LocalizationPage;
export { LocalizationPage };