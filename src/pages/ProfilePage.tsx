import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Mail, Phone, MapPin, Clock, Monitor, LogOut, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import { formatDistanceToNow } from 'date-fns';

const ProfilePage = () => {
  const { profile, sessions, loading, error, updateProfile, uploadAvatar, terminateSession } = useUserProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    mobile_number: '',
    bio: '',
    address_line1: '',
    address_line2: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        display_name: profile.display_name || '',
        mobile_number: profile.mobile_number || '',
        bio: profile.bio || '',
        address_line1: profile.address_line1 || '',
        address_line2: profile.address_line2 || '',
        village: profile.village || '',
        district: profile.district || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateProfile(formData);
    setIsSaving(false);
    
    if (success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error('Failed to update profile');
    }
  };

  const handleSessionTerminate = async (sessionId: string) => {
    const success = await terminateSession(sessionId);
    if (success) {
      toast.success('Session terminated successfully');
    } else {
      toast.error('Failed to terminate session');
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container max-w-6xl py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">Failed to load profile</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = profile.display_name || profile.full_name || profile.email;

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <AvatarUploader
              currentAvatar={profile.avatar_url}
              userName={displayName}
              onUpload={uploadAvatar}
            />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{displayName}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-4 mt-3">
                {profile.tenant_info && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.tenant_info.tenant_name || 'Organization'}</span>
                    </div>
                    <Badge variant={profile.tenant_info.is_active ? 'default' : 'secondary'}>
                      {profile.role || 'User'}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="How you'd like to be called"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile_number">Mobile Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobile_number"
                    type="tel"
                    value={formData.mobile_number}
                    onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_line1">Address Line 1</Label>
                    <Input
                      id="address_line1"
                      value={formData.address_line1}
                      onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_line2">Address Line 2</Label>
                    <Input
                      id="address_line2"
                      value={formData.address_line2}
                      onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="village">Village/Town</Label>
                    <Input
                      id="village"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      placeholder="Village or town name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="District name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="State name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="Postal code"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View your account details and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm font-medium">Account ID</span>
                  <span className="text-sm text-muted-foreground font-mono">{profile.id}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm text-muted-foreground">{profile.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm font-medium">Role</span>
                  <Badge>{profile.role || 'User'}</Badge>
                </div>
                {profile.tenant_info && (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-sm font-medium">Organization</span>
                      <span className="text-sm text-muted-foreground">{profile.tenant_info.tenant_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant={profile.tenant_info.is_active ? 'default' : 'secondary'}>
                        {profile.tenant_info.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium">Member Since</span>
                  <span className="text-sm text-muted-foreground">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active login sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active sessions found</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Monitor className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{session.user_agent || 'Unknown Device'}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              Last active {formatDistanceToNow(new Date(session.last_active_at), { addSuffix: true })}
                            </span>
                          </div>
                          {session.ip_address && (
                            <p className="text-xs text-muted-foreground">IP: {session.ip_address}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSessionTerminate(session.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Terminate
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
