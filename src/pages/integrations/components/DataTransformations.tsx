import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Settings, Plus, Play, Trash2 } from "lucide-react";

interface DataTransformation {
  id: string;
  name: string;
  source_format: string;
  target_format: string;
  transformation_rules: Record<string, any>;
  validation_rules: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

const SUPPORTED_FORMATS = [
  'json',
  'xml',
  'csv',
  'excel',
  'api_response',
  'database_record'
];

export function DataTransformations() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: transformations, isLoading } = useQuery({
    queryKey: ['data-transformations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_transformations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DataTransformation[];
    }
  });

  const createTransformationMutation = useMutation({
    mutationFn: async (formData: {
      name: string;
      source_format: string;
      target_format: string;
      transformation_rules: Record<string, any>;
      validation_rules: Record<string, any>;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get tenant_id from user_tenants
      const { data: userTenant } = await supabase
        .from('user_tenants')
        .select('tenant_id')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .single();

      if (!userTenant) throw new Error('No active tenant found');

      const { data, error } = await supabase
        .from('data_transformations')
        .insert({
          ...formData,
          tenant_id: userTenant.tenant_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-transformations'] });
      setIsCreateDialogOpen(false);
      toast.success('Data transformation created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create transformation: ' + error.message);
    }
  });

  const deleteTransformationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('data_transformations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-transformations'] });
      toast.success('Transformation deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete transformation: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    let transformationRules = {};
    let validationRules = {};

    try {
      const rulesText = formData.get('transformation_rules') as string;
      if (rulesText) {
        transformationRules = JSON.parse(rulesText);
      }
    } catch {
      toast.error('Invalid JSON format for transformation rules');
      return;
    }

    try {
      const validationText = formData.get('validation_rules') as string;
      if (validationText) {
        validationRules = JSON.parse(validationText);
      }
    } catch {
      toast.error('Invalid JSON format for validation rules');
      return;
    }

    createTransformationMutation.mutate({
      name: formData.get('name') as string,
      source_format: formData.get('source_format') as string,
      target_format: formData.get('target_format') as string,
      transformation_rules: transformationRules,
      validation_rules: validationRules
    });
  };

  if (isLoading) {
    return <div>Loading data transformations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Data Transformations</h2>
          <p className="text-muted-foreground">
            Create and manage data transformation rules for external integrations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Transformation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Data Transformation</DialogTitle>
              <DialogDescription>
                Define rules to transform data between different formats
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Transformation Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., SAP to Internal Format"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source_format">Source Format</Label>
                  <Select name="source_format" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source format" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_FORMATS.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target_format">Target Format</Label>
                  <Select name="target_format" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target format" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_FORMATS.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="transformation_rules">Transformation Rules (JSON)</Label>
                <Textarea
                  id="transformation_rules"
                  name="transformation_rules"
                  placeholder={`{
  "field_mapping": {
    "external_field": "internal_field",
    "customer_name": "farmer_name"
  },
  "data_conversion": {
    "date_format": "YYYY-MM-DD"
  }
}`}
                  className="font-mono text-sm"
                  rows={8}
                />
              </div>

              <div>
                <Label htmlFor="validation_rules">Validation Rules (JSON)</Label>
                <Textarea
                  id="validation_rules"
                  name="validation_rules"
                  placeholder={`{
  "required_fields": ["name", "phone"],
  "data_types": {
    "phone": "string",
    "age": "number"
  }
}`}
                  className="font-mono text-sm"
                  rows={6}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTransformationMutation.isPending}>
                  {createTransformationMutation.isPending ? 'Creating...' : 'Create Transformation'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {transformations?.map((transformation) => (
          <Card key={transformation.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <h3 className="font-semibold">{transformation.name}</h3>
                    <Badge variant={transformation.is_active ? "default" : "secondary"}>
                      {transformation.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>
                      {transformation.source_format.toUpperCase()} → {transformation.target_format.toUpperCase()}
                    </span>
                    <span>
                      {Object.keys(transformation.transformation_rules).length} rules
                    </span>
                    <span>
                      {Object.keys(transformation.validation_rules).length} validations
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTransformationMutation.mutate(transformation.id)}
                    disabled={deleteTransformationMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}