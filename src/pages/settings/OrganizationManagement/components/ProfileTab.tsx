import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useOrganizationProfile } from '@/hooks/organization/useOrganizationProfile';
import { useOrganizationSettings } from '@/hooks/organization/useOrganizationSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Mail, Phone, Globe, MapPin, Clock } from 'lucide-react';

const ProfileTab = () => {
  const { profile, isLoading, updateProfile, isUpdating } = useOrganizationProfile();
  const { settings, updateSettings } = useOrganizationSettings();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    timezone: '',
  });

  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        description: profile.description || '',
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        address: profile.address || '',
        timezone: profile.timezone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (settings?.social_links) {
      setSocialLinks({
        facebook: settings.social_links.facebook || '',
        twitter: settings.social_links.twitter || '',
        linkedin: settings.social_links.linkedin || '',
        instagram: settings.social_links.instagram || '',
      });
    }
  }, [settings]);

  const handleProfileUpdate = async () => {
    await updateProfile(formData);
  };

  const handleSocialLinksUpdate = async () => {
    await updateSettings({ social_links: socialLinks });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Organization Identity
          </CardTitle>
          <CardDescription>
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter organization name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                placeholder="e.g., Asia/Kolkata"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your organization"
              rows={4}
            />
          </div>

          <Button onClick={handleProfileUpdate} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Contact Information
          </CardTitle>
          <CardDescription>
            How people can reach your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website URL
            </Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Physical Address
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, State, Country"
              rows={3}
            />
          </div>

          <Button onClick={handleProfileUpdate} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Contact Info'}
          </Button>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>
            Connect your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="https://instagram.com/yourhandle"
              />
            </div>
          </div>

          <Button onClick={handleSocialLinksUpdate}>
            Save Social Links
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;
