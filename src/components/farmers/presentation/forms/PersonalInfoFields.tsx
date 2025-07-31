
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import type { FarmerFormData } from '@/hooks/business/useFarmerValidation';
import type { ValidationErrors } from '@/hooks/core/useFormValidation';

interface PersonalInfoFieldsProps {
  control: Control<FarmerFormData>;
  errors: ValidationErrors;
  onFormChange: (field: keyof FarmerFormData, value: any) => void;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
  control,
  errors,
  onFormChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onFormChange('fullName', e.target.value);
                  }}
                  placeholder="Enter full name"
                />
              </FormControl>
              {errors.fullName && <FormMessage>{errors.fullName}</FormMessage>}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onFormChange('phone', e.target.value);
                  }}
                  placeholder="Enter phone number"
                  maxLength={10}
                />
              </FormControl>
              {errors.phone && <FormMessage>{errors.phone}</FormMessage>}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  onChange={(e) => {
                    field.onChange(e);
                    onFormChange('email', e.target.value);
                  }}
                  placeholder="Enter email address"
                />
              </FormControl>
              {errors.email && <FormMessage>{errors.email}</FormMessage>}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  onChange={(e) => {
                    field.onChange(e);
                    onFormChange('dateOfBirth', e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
