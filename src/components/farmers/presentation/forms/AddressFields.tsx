
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import type { FarmerFormData } from '@/hooks/business/useFarmerValidation';
import type { ValidationErrors } from '@/hooks/core/useFormValidation';

interface AddressFieldsProps {
  control: Control<FarmerFormData>;
  errors: ValidationErrors;
  onFormChange: (field: keyof FarmerFormData, value: any) => void;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({
  control,
  errors,
  onFormChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Address Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="village"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Village *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onFormChange('village', e.target.value);
                  }}
                  placeholder="Enter village name"
                />
              </FormControl>
              {errors.village && <FormMessage>{errors.village}</FormMessage>}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onFormChange('district', e.target.value);
                  }}
                  placeholder="Enter district"
                />
              </FormControl>
              {errors.district && <FormMessage>{errors.district}</FormMessage>}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onFormChange('state', e.target.value);
                  }}
                  placeholder="Enter state"
                />
              </FormControl>
              {errors.state && <FormMessage>{errors.state}</FormMessage>}
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
