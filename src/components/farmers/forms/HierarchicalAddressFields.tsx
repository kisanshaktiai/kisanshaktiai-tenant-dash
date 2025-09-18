import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Globe, Home } from 'lucide-react';

interface HierarchicalAddressFieldsProps {
  formData: any;
  errors: any;
  onFormChange: (field: string, value: any) => void;
}

interface LocationData {
  id: string;
  name: string;
  code?: string;
}

export const HierarchicalAddressFields: React.FC<HierarchicalAddressFieldsProps> = ({
  formData,
  errors,
  onFormChange,
}) => {
  const [countries, setCountries] = useState<LocationData[]>([]);
  const [states, setStates] = useState<LocationData[]>([]);
  const [districts, setDistricts] = useState<LocationData[]>([]);
  const [talukas, setTalukas] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    districts: false,
    talukas: false,
  });

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (formData.country) {
      loadStates(formData.country);
      // Reset dependent fields
      onFormChange('state', '');
      onFormChange('district', '');
      onFormChange('taluka', '');
      onFormChange('village', '');
      setStates([]);
      setDistricts([]);
      setTalukas([]);
    }
  }, [formData.country]);

  // Load districts when state changes
  useEffect(() => {
    if (formData.state) {
      loadDistricts(formData.state);
      // Reset dependent fields
      onFormChange('district', '');
      onFormChange('taluka', '');
      onFormChange('village', '');
      setDistricts([]);
      setTalukas([]);
    }
  }, [formData.state]);

  // Load talukas when district changes
  useEffect(() => {
    if (formData.district) {
      loadTalukas(formData.district);
      // Reset dependent fields
      onFormChange('taluka', '');
      onFormChange('village', '');
      setTalukas([]);
    }
  }, [formData.district]);

  const loadCountries = async () => {
    setLoading(prev => ({ ...prev, countries: true }));
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error loading countries:', error);
        // Set default India if no data
        setCountries([{ id: 'india', name: 'India', code: 'IN' }]);
      } else if (data && data.length > 0) {
        setCountries(data);
      } else {
        // Set default India if no data
        setCountries([{ id: 'india', name: 'India', code: 'IN' }]);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
      setCountries([{ id: 'india', name: 'India', code: 'IN' }]);
    } finally {
      setLoading(prev => ({ ...prev, countries: false }));
    }
  };

  const loadStates = async (countryId: string) => {
    setLoading(prev => ({ ...prev, states: true }));
    try {
      const { data, error } = await supabase
        .from('states')
        .select('id, name, code')
        .eq('country_id', countryId)
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error loading states:', error);
        setStates([]);
      } else if (data) {
        setStates(data);
      }
    } catch (error) {
      console.error('Error loading states:', error);
      setStates([]);
    } finally {
      setLoading(prev => ({ ...prev, states: false }));
    }
  };

  const loadDistricts = async (stateId: string) => {
    setLoading(prev => ({ ...prev, districts: true }));
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('id, name')
        .eq('state_id', stateId)
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error loading districts:', error);
        setDistricts([]);
      } else if (data) {
        setDistricts(data);
      }
    } catch (error) {
      console.error('Error loading districts:', error);
      setDistricts([]);
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  };

  const loadTalukas = async (districtId: string) => {
    setLoading(prev => ({ ...prev, talukas: true }));
    try {
      const { data, error } = await supabase
        .from('talukas')
        .select('id, name')
        .eq('district_id', districtId)
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error loading talukas:', error);
        setTalukas([]);
      } else if (data) {
        setTalukas(data);
      }
    } catch (error) {
      console.error('Error loading talukas:', error);
      setTalukas([]);
    } finally {
      setLoading(prev => ({ ...prev, talukas: false }));
    }
  };

  // Check if manual input should be allowed
  const allowManualInput = (type: string): boolean => {
    switch (type) {
      case 'state':
        return states.length === 0 && !loading.states;
      case 'district':
        return districts.length === 0 && !loading.districts && formData.state;
      case 'taluka':
        return talukas.length === 0 && !loading.talukas && formData.district;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Country Selection */}
      <div>
        <Label htmlFor="country" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Country
        </Label>
        {countries.length > 0 ? (
          <Select 
            value={formData.country || ''} 
            onValueChange={(value) => onFormChange('country', value)}
            disabled={loading.countries}
          >
            <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
              <SelectValue placeholder={loading.countries ? "Loading..." : "Select country"} />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="country"
            value={formData.country || ''}
            onChange={(e) => onFormChange('country', e.target.value)}
            placeholder="Enter country name"
            className={errors.country ? 'border-red-500' : ''}
          />
        )}
        {errors.country && (
          <p className="text-sm text-destructive mt-1">{errors.country}</p>
        )}
      </div>

      {/* State Selection */}
      <div>
        <Label htmlFor="state" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          State
        </Label>
        {states.length > 0 ? (
          <Select 
            value={formData.state || ''} 
            onValueChange={(value) => onFormChange('state', value)}
            disabled={!formData.country || loading.states}
          >
            <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
              <SelectValue placeholder={loading.states ? "Loading..." : "Select state"} />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.id} value={state.id}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="state"
            value={formData.state || ''}
            onChange={(e) => onFormChange('state', e.target.value)}
            placeholder={!formData.country ? "Select country first" : "Enter state name"}
            disabled={!formData.country}
            className={errors.state ? 'border-red-500' : ''}
          />
        )}
        {errors.state && (
          <p className="text-sm text-destructive mt-1">{errors.state}</p>
        )}
      </div>

      {/* District Selection */}
      <div>
        <Label htmlFor="district" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          District
        </Label>
        {districts.length > 0 ? (
          <Select 
            value={formData.district || ''} 
            onValueChange={(value) => onFormChange('district', value)}
            disabled={!formData.state || loading.districts}
          >
            <SelectTrigger className={errors.district ? 'border-red-500' : ''}>
              <SelectValue placeholder={loading.districts ? "Loading..." : "Select district"} />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="district"
            value={formData.district || ''}
            onChange={(e) => onFormChange('district', e.target.value)}
            placeholder={!formData.state ? "Select state first" : "Enter district name"}
            disabled={!formData.state}
            className={errors.district ? 'border-red-500' : ''}
          />
        )}
        {errors.district && (
          <p className="text-sm text-destructive mt-1">{errors.district}</p>
        )}
      </div>

      {/* Taluka/Block Selection */}
      <div>
        <Label htmlFor="taluka" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Taluka/Block
        </Label>
        {talukas.length > 0 ? (
          <Select 
            value={formData.taluka || ''} 
            onValueChange={(value) => onFormChange('taluka', value)}
            disabled={!formData.district || loading.talukas}
          >
            <SelectTrigger className={errors.taluka ? 'border-red-500' : ''}>
              <SelectValue placeholder={loading.talukas ? "Loading..." : "Select taluka/block"} />
            </SelectTrigger>
            <SelectContent>
              {talukas.map((taluka) => (
                <SelectItem key={taluka.id} value={taluka.id}>
                  {taluka.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="taluka"
            value={formData.taluka || ''}
            onChange={(e) => onFormChange('taluka', e.target.value)}
            placeholder={!formData.district ? "Select district first" : "Enter taluka/block name"}
            disabled={!formData.district}
            className={errors.taluka ? 'border-red-500' : ''}
          />
        )}
        {errors.taluka && (
          <p className="text-sm text-destructive mt-1">{errors.taluka}</p>
        )}
      </div>

      {/* Village Input */}
      <div>
        <Label htmlFor="village" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Village
        </Label>
        <Input
          id="village"
          value={formData.village || ''}
          onChange={(e) => onFormChange('village', e.target.value)}
          placeholder={!formData.taluka ? "Select taluka first" : "Enter village name"}
          disabled={!formData.taluka}
          className={errors.village ? 'border-red-500' : ''}
        />
        {errors.village && (
          <p className="text-sm text-destructive mt-1">{errors.village}</p>
        )}
      </div>

      {/* Pincode */}
      <div>
        <Label htmlFor="pincode">Pincode</Label>
        <Input
          id="pincode"
          value={formData.pincode || ''}
          onChange={(e) => onFormChange('pincode', e.target.value)}
          placeholder="Enter 6-digit pincode"
          maxLength={6}
          className={errors.pincode ? 'border-red-500' : ''}
        />
        {errors.pincode && (
          <p className="text-sm text-destructive mt-1">{errors.pincode}</p>
        )}
      </div>
    </div>
  );
};