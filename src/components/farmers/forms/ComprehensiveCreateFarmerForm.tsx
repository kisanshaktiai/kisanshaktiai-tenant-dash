import React, { useState } from 'react';
import { HierarchicalAddressFields } from './HierarchicalAddressFields';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LanguageSelect } from '@/components/ui/language-select';
import { X, Plus, User, MapPin, Tractor, Smartphone, Globe } from 'lucide-react';
import { type FarmerFormData } from '@/hooks/business/useFarmerValidation';
import { useTranslation } from '@/hooks/useTranslation';
import { DEFAULT_LOCALE } from '@/lib/i18n';

interface ComprehensiveCreateFarmerFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FarmerFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  onFormChange: (field: keyof FarmerFormData, value: any) => void;
  onSubmit: (data: FarmerFormData) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const CROP_OPTIONS = [
  'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Bajra', 'Jowar',
  'Groundnut', 'Soybean', 'Sunflower', 'Mustard', 'Sesame', 'Turmeric',
  'Chilli', 'Onion', 'Potato', 'Tomato', 'Brinjal', 'Okra', 'Cabbage',
  'Cauliflower', 'Carrot', 'Beans', 'Peas', 'Mango', 'Banana', 'Grapes',
  'Orange', 'Apple', 'Pomegranate', 'Coconut', 'Areca Nut', 'Cashew'
];

const IRRIGATION_SOURCES = [
  'Bore Well', 'Open Well', 'Canal', 'River', 'Pond', 'Drip Irrigation',
  'Sprinkler', 'Rainwater Harvesting', 'None'
];

export const ComprehensiveCreateFarmerForm: React.FC<ComprehensiveCreateFarmerFormProps> = ({
  isOpen,
  onClose,
  formData,
  errors,
  isSubmitting,
  onFormChange,
  onSubmit,
}) => {
  const [cropInput, setCropInput] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addCrop = () => {
    if (cropInput.trim() && !formData.primaryCrops.includes(cropInput.trim())) {
      onFormChange('primaryCrops', [...formData.primaryCrops, cropInput.trim()]);
      setCropInput('');
    }
  };

  const removeCrop = (cropToRemove: string) => {
    onFormChange('primaryCrops', formData.primaryCrops.filter(crop => crop !== cropToRemove));
  };

  const addPredefinedCrop = (crop: string) => {
    if (!formData.primaryCrops.includes(crop)) {
      onFormChange('primaryCrops', [...formData.primaryCrops, crop]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New Farmer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </TabsTrigger>
              <TabsTrigger value="farming" className="flex items-center gap-2">
                <Tractor className="h-4 w-4" />
                Farming
              </TabsTrigger>
              <TabsTrigger value="auth" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Login Setup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <p className="text-sm text-gray-600">
                    Only name and mobile number are required. Other details can be added later.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => onFormChange('fullName', e.target.value)}
                        placeholder="Enter full name"
                        className={errors.fullName ? 'border-red-500' : ''}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Mobile Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => onFormChange('phone', e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Format: 9876543210 or +919876543210
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => onFormChange('email', e.target.value)}
                        placeholder="Enter email address"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => onFormChange('dateOfBirth', e.target.value)}
                        className={errors.dateOfBirth ? 'border-red-500' : ''}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender">Gender (Optional)</Label>
                      <Select value={formData.gender} onValueChange={(value) => onFormChange('gender', value)}>
                        <SelectTrigger id="gender" className={errors.gender ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && (
                        <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="languagePreference" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {t('farmer.languagePreference')}
                      </Label>
                      <LanguageSelect
                        value={formData.languagePreference}
                        onValueChange={(value) => onFormChange('languagePreference', value)}
                        placeholder={t('farmer.selectLanguage')}
                        showRegionGroups={true}
                        showNativeNames={true}
                        className={errors.languagePreference ? 'border-red-500' : ''}
                      />
                      {errors.languagePreference && (
                        <p className="text-sm text-red-500 mt-1">{errors.languagePreference}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {t('farmer.languagePreferenceDesc')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                  <p className="text-sm text-gray-600">
                    Select location hierarchically. If options are not available, you can enter manually.
                  </p>
                </CardHeader>
                <CardContent>
                  <HierarchicalAddressFields
                    formData={formData}
                    errors={errors}
                    onFormChange={onFormChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="farming" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Farming Information</CardTitle>
                  <p className="text-sm text-gray-600">
                    Farming details are optional and can be updated later.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="farmingExperience">Farming Experience (Years)</Label>
                      <Input
                        id="farmingExperience"
                        type="number"
                        min="0"
                        value={formData.farmingExperience}
                        onChange={(e) => onFormChange('farmingExperience', e.target.value)}
                        placeholder="Enter years of experience"
                        className={errors.farmingExperience ? 'border-red-500' : ''}
                      />
                      {errors.farmingExperience && (
                        <p className="text-sm text-red-500 mt-1">{errors.farmingExperience}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="totalLandSize">Total Land Size (Acres)</Label>
                      <Input
                        id="totalLandSize"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.totalLandSize}
                        onChange={(e) => onFormChange('totalLandSize', e.target.value)}
                        placeholder="Enter land size in acres"
                        className={errors.totalLandSize ? 'border-red-500' : ''}
                      />
                      {errors.totalLandSize && (
                        <p className="text-sm text-red-500 mt-1">{errors.totalLandSize}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="irrigationSource">Irrigation Source</Label>
                    <Select value={formData.irrigationSource} onValueChange={(value) => onFormChange('irrigationSource', value)}>
                      <SelectTrigger id="irrigationSource">
                        <SelectValue placeholder="Select irrigation source" />
                      </SelectTrigger>
                      <SelectContent>
                        {IRRIGATION_SOURCES.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Crops (Optional)</Label>
                    
                    {/* Selected crops */}
                    <div className="flex flex-wrap gap-2">
                      {formData.primaryCrops.map((crop) => (
                        <Badge key={crop} variant="secondary" className="flex items-center gap-1">
                          {crop}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeCrop(crop)}
                          />
                        </Badge>
                      ))}
                    </div>

                    {/* Add custom crop */}
                    <div className="flex gap-2">
                      <Input
                        id="cropInput"
                        name="cropInput"
                        value={cropInput}
                        onChange={(e) => setCropInput(e.target.value)}
                        placeholder="Enter crop name"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCrop())}
                      />
                      <Button type="button" onClick={addCrop} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Predefined crops */}
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                      {CROP_OPTIONS.map((crop) => (
                        <Button
                          key={crop}
                          type="button"
                          variant={formData.primaryCrops.includes(crop) ? "default" : "outline"}
                          size="sm"
                          onClick={() => addPredefinedCrop(crop)}
                          className="text-xs"
                        >
                          {crop}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasStorage"
                        checked={formData.hasStorage}
                        onCheckedChange={(checked) => onFormChange('hasStorage', checked)}
                      />
                      <Label htmlFor="hasStorage">Has Storage Facility</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasTractor"
                        checked={formData.hasTractor}
                        onCheckedChange={(checked) => onFormChange('hasTractor', checked)}
                      />
                      <Label htmlFor="hasTractor">Owns Tractor</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => onFormChange('notes', e.target.value)}
                      placeholder="Any additional information about the farmer"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Login Setup</CardTitle>
                  <p className="text-sm text-gray-600">
                    Farmer will use mobile number and PIN to login to the mobile app
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pin">Create PIN *</Label>
                      <Input
                        id="pin"
                        type="password"
                        value={formData.pin}
                        onChange={(e) => onFormChange('pin', e.target.value)}
                        placeholder="Enter 4-6 digit PIN"
                        maxLength={6}
                        className={errors.pin ? 'border-red-500' : ''}
                      />
                      {errors.pin && (
                        <p className="text-sm text-red-500 mt-1">{errors.pin}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        PIN should be 4-6 digits
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="confirmPin">Confirm PIN *</Label>
                      <Input
                        id="confirmPin"
                        type="password"
                        value={formData.confirmPin}
                        onChange={(e) => onFormChange('confirmPin', e.target.value)}
                        placeholder="Re-enter PIN"
                        maxLength={6}
                        className={errors.confirmPin ? 'border-red-500' : ''}
                      />
                      {errors.confirmPin && (
                        <p className="text-sm text-red-500 mt-1">{errors.confirmPin}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Login Credentials Summary</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <p><strong>Mobile:</strong> {formData.phone || 'Not entered'}</p>
                      <p><strong>PIN:</strong> {formData.pin ? '•'.repeat(formData.pin.length) : 'Not entered'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {activeTab !== 'personal' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ['personal', 'address', 'farming', 'auth'];
                    const currentIndex = tabs.indexOf(activeTab);
                    setActiveTab(tabs[currentIndex - 1]);
                  }}
                >
                  Previous
                </Button>
              )}
              {activeTab !== 'auth' ? (
                <Button
                  type="button"
                  onClick={() => {
                    const tabs = ['personal', 'address', 'farming', 'auth'];
                    const currentIndex = tabs.indexOf(activeTab);
                    setActiveTab(tabs[currentIndex + 1]);
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Farmer...' : 'Create Farmer'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
