
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Control } from 'react-hook-form';
import type { FarmerFormData } from '@/hooks/business/useFarmerValidation';
import type { ValidationErrors } from '@/hooks/core/useFormValidation';

interface FarmingInfoFieldsProps {
  control: Control<FarmerFormData>;
  errors: ValidationErrors;
  formData: FarmerFormData;
  onFormChange: (field: keyof FarmerFormData, value: any) => void;
}

const cropOptions = [
  'Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Soybean',
  'Groundnut', 'Sunflower', 'Mustard', 'Barley', 'Gram', 'Tur',
  'Tomato', 'Potato', 'Onion', 'Chili', 'Brinjal', 'Okra'
];

export const FarmingInfoFields: React.FC<FarmingInfoFieldsProps> = ({
  control,
  errors,
  formData,
  onFormChange,
}) => {
  const toggleCrop = (crop: string) => {
    const currentCrops = formData.primaryCrops;
    const newCrops = currentCrops.includes(crop)
      ? currentCrops.filter(c => c !== crop)
      : [...currentCrops, crop];
    
    onFormChange('primaryCrops', newCrops);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Farming Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="farmingExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Farming Experience (years) *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  onChange={(e) => {
                    field.onChange(e);
                    onFormChange('farmingExperience', e.target.value);
                  }}
                  placeholder="Enter years of experience"
                  min="0"
                />
              </FormControl>
              {errors.farmingExperience && <FormMessage>{errors.farmingExperience}</FormMessage>}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="totalLandSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Land Size (acres) *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.1"
                  onChange={(e) => {
                    field.onChange(e);
                    onFormChange('totalLandSize', e.target.value);
                  }}
                  placeholder="Enter land size in acres"
                  min="0"
                />
              </FormControl>
              {errors.totalLandSize && <FormMessage>{errors.totalLandSize}</FormMessage>}
            </FormItem>
          )}
        />
      </div>

      {/* Primary Crops */}
      <div className="space-y-2">
        <FormLabel>Primary Crops *</FormLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {cropOptions.map((crop) => (
            <label key={crop} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={formData.primaryCrops.includes(crop)}
                onCheckedChange={() => toggleCrop(crop)}
              />
              <span className="text-sm">{crop}</span>
            </label>
          ))}
        </div>
        {errors.primaryCrops && <FormMessage>{errors.primaryCrops}</FormMessage>}
      </div>

      {/* Farm Equipment */}
      <div className="space-y-2">
        <h4 className="font-medium">Farm Equipment</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <Checkbox
              checked={formData.hasStorage}
              onCheckedChange={(checked) => onFormChange('hasStorage', checked)}
            />
            <span>Has Storage Facility</span>
          </label>
          <label className="flex items-center space-x-2">
            <Checkbox
              checked={formData.hasTractor}
              onCheckedChange={(checked) => onFormChange('hasTractor', checked)}
            />
            <span>Owns Tractor</span>
          </label>
        </div>
      </div>

      {/* Notes */}
      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  onFormChange('notes', e.target.value);
                }}
                placeholder="Any additional information about the farmer"
                rows={3}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
