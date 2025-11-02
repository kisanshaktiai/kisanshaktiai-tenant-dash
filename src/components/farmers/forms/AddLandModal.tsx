import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { Loader2, MapPin } from 'lucide-react';

interface AddLandModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerId: string;
  onSuccess: () => void;
}

export const AddLandModal: React.FC<AddLandModalProps> = ({ 
  isOpen, 
  onClose, 
  farmerId,
  onSuccess 
}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    survey_number: '',
    area_acres: '',
    area_guntas: '',
    village: '',
    taluka: '',
    district: '',
    state: '',
    soil_type: '',
    irrigation_type: '',
    water_source: '',
    current_crop: '',
    ownership_type: 'owned',
    notes: '',
    center_lat: '',
    center_lon: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTenant?.id) {
      toast.error('No tenant selected');
      return;
    }

    if (!formData.name || !formData.area_acres) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);

    try {
      const landData: any = {
        tenant_id: currentTenant.id,
        farmer_id: farmerId,
        name: formData.name,
        survey_number: formData.survey_number || null,
        area_acres: parseFloat(formData.area_acres),
        area_guntas: formData.area_guntas ? parseFloat(formData.area_guntas) : null,
        village: formData.village || null,
        taluka: formData.taluka || null,
        district: formData.district || null,
        state: formData.state || null,
        soil_type: formData.soil_type || null,
        irrigation_type: formData.irrigation_type || null,
        water_source: formData.water_source || null,
        current_crop: formData.current_crop || null,
        ownership_type: formData.ownership_type || 'owned',
        notes: formData.notes || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add GPS coordinates if provided
      if (formData.center_lat && formData.center_lon) {
        landData.center_lat = parseFloat(formData.center_lat);
        landData.center_lon = parseFloat(formData.center_lon);
      }

      const { data, error } = await supabase
        .from('lands')
        .insert(landData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Land parcel added successfully!');
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        survey_number: '',
        area_acres: '',
        area_guntas: '',
        village: '',
        taluka: '',
        district: '',
        state: '',
        soil_type: '',
        irrigation_type: '',
        water_source: '',
        current_crop: '',
        ownership_type: 'owned',
        notes: '',
        center_lat: '',
        center_lon: '',
      });
    } catch (error: any) {
      console.error('Error adding land:', error);
      toast.error(error.message || 'Failed to add land parcel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Land Parcel</DialogTitle>
          <DialogDescription>
            Add a new land parcel for this farmer. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Basic Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Land Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., North Field"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="survey_number">Survey Number</Label>
                <Input
                  id="survey_number"
                  value={formData.survey_number}
                  onChange={(e) => setFormData({ ...formData, survey_number: e.target.value })}
                  placeholder="e.g., 123/4A"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area_acres">
                  Area (Acres) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="area_acres"
                  type="number"
                  step="0.01"
                  value={formData.area_acres}
                  onChange={(e) => setFormData({ ...formData, area_acres: e.target.value })}
                  placeholder="e.g., 5.5"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_guntas">Area (Guntas)</Label>
                <Input
                  id="area_guntas"
                  type="number"
                  step="0.01"
                  value={formData.area_guntas}
                  onChange={(e) => setFormData({ ...formData, area_guntas: e.target.value })}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownership_type">Ownership</Label>
                <Select
                  value={formData.ownership_type}
                  onValueChange={(value) => setFormData({ ...formData, ownership_type: value })}
                >
                  <SelectTrigger id="ownership_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="leased">Leased</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="sharecropped">Sharecropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Location</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="village">Village</Label>
                <Input
                  id="village"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  placeholder="Village name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taluka">Taluka</Label>
                <Input
                  id="taluka"
                  value={formData.taluka}
                  onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                  placeholder="Taluka name"
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
            </div>
          </div>

          {/* Farming Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Farming Details</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="soil_type">Soil Type</Label>
                <Select
                  value={formData.soil_type}
                  onValueChange={(value) => setFormData({ ...formData, soil_type: value })}
                >
                  <SelectTrigger id="soil_type">
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="black">Black Soil</SelectItem>
                    <SelectItem value="red">Red Soil</SelectItem>
                    <SelectItem value="alluvial">Alluvial Soil</SelectItem>
                    <SelectItem value="laterite">Laterite Soil</SelectItem>
                    <SelectItem value="clay">Clay Soil</SelectItem>
                    <SelectItem value="sandy">Sandy Soil</SelectItem>
                    <SelectItem value="loamy">Loamy Soil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="irrigation_type">Irrigation Type</Label>
                <Select
                  value={formData.irrigation_type}
                  onValueChange={(value) => setFormData({ ...formData, irrigation_type: value })}
                >
                  <SelectTrigger id="irrigation_type">
                    <SelectValue placeholder="Select irrigation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drip">Drip Irrigation</SelectItem>
                    <SelectItem value="sprinkler">Sprinkler</SelectItem>
                    <SelectItem value="flood">Flood Irrigation</SelectItem>
                    <SelectItem value="rainfed">Rainfed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="water_source">Water Source</Label>
                <Select
                  value={formData.water_source}
                  onValueChange={(value) => setFormData({ ...formData, water_source: value })}
                >
                  <SelectTrigger id="water_source">
                    <SelectValue placeholder="Select water source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borewell">Borewell</SelectItem>
                    <SelectItem value="canal">Canal</SelectItem>
                    <SelectItem value="river">River</SelectItem>
                    <SelectItem value="well">Open Well</SelectItem>
                    <SelectItem value="pond">Farm Pond</SelectItem>
                    <SelectItem value="rain">Rainwater</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_crop">Current Crop</Label>
                <Input
                  id="current_crop"
                  value={formData.current_crop}
                  onChange={(e) => setFormData({ ...formData, current_crop: e.target.value })}
                  placeholder="e.g., Paddy, Cotton, Wheat"
                />
              </div>
            </div>
          </div>

          {/* GPS Coordinates (Optional but needed for NDVI) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">GPS Coordinates</h4>
              <span className="text-xs text-muted-foreground">(Required for NDVI analysis)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="center_lat">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Latitude
                </Label>
                <Input
                  id="center_lat"
                  type="number"
                  step="0.000001"
                  value={formData.center_lat}
                  onChange={(e) => setFormData({ ...formData, center_lat: e.target.value })}
                  placeholder="e.g., 17.385044"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="center_lon">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Longitude
                </Label>
                <Input
                  id="center_lon"
                  type="number"
                  step="0.000001"
                  value={formData.center_lon}
                  onChange={(e) => setFormData({ ...formData, center_lon: e.target.value })}
                  placeholder="e.g., 78.486671"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information about this land..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Land Parcel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};