
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';
import type { FarmerFormData } from '@/hooks/business/useFarmerValidation';
import type { ValidationErrors } from '@/hooks/core/useFormValidation';

interface CreateFarmerFormProps {
  isOpen: boolean;
  formData: FarmerFormData;
  errors: ValidationErrors;
  isSubmitting: boolean;
  onFormChange: (field: keyof FarmerFormData, value: any) => void;
  onSubmit: (data: FarmerFormData) => void;
  onClose: () => void;
}

const cropOptions = [
  'Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Soybean',
  'Groundnut', 'Sunflower', 'Mustard', 'Barley', 'Gram', 'Tur',
  'Tomato', 'Potato', 'Onion', 'Chili', 'Brinjal', 'Okra'
];

const formSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  village: z.string().min(1, 'Village is required'),
  taluka: z.string().optional(),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Pincode is required'),
  farmingExperience: z.string().min(1, 'Farming experience is required'),
  totalLandSize: z.string().min(1, 'Land size is required'),
  irrigationSource: z.string().optional(),
  hasStorage: z.boolean(),
  hasTractor: z.boolean(),
  primaryCrops: z.array(z.string()).min(1, 'At least one crop is required'),
  notes: z.string().optional(),
});

export const CreateFarmerForm: React.FC<CreateFarmerFormProps> = ({
  isOpen,
  formData,
  errors,
  isSubmitting,
  onFormChange,
  onSubmit,
  onClose,
}) => {
  const form = useForm<FarmerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
    values: formData,
  });

  const handleFormSubmit = (data: FarmerFormData) => {
    onSubmit(data);
  };

  const toggleCrop = (crop: string) => {
    const currentCrops = formData.primaryCrops;
    const newCrops = currentCrops.includes(crop)
      ? currentCrops.filter(c => c !== crop)
      : [...currentCrops, crop];
    
    onFormChange('primaryCrops', newCrops);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Farmer</DialogTitle>
          <DialogDescription>
            Fill in the farmer's information to add them to your network.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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

            {/* Farming Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Farming Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
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

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Farmer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
