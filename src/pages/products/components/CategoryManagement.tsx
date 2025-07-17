import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Trees, 
  Plus, 
  Edit, 
  Trash2, 
  FolderOpen,
  Folder
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  icon_url: string | null;
}

export default function CategoryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    is_active: true,
    sort_order: 0
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { error } = await supabase
        .from('product_categories')
        .insert([{ 
          ...data, 
          slug,
          parent_id: data.parent_id || null
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Category created successfully' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: 'Error creating category', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { error } = await supabase
        .from('product_categories')
        .update({ 
          ...data, 
          slug,
          parent_id: data.parent_id || null
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Category updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating category', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Category deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      toast({ 
        title: 'Error deleting category', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parent_id: '',
      is_active: true,
      sort_order: 0
    });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id || '',
      is_active: category.is_active,
      sort_order: category.sort_order
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ ...formData, id: editingCategory.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const buildCategoryTree = (categories: Category[], parentId: string | null = null): Category[] => {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(categories, cat.id)
      }));
  };

  const renderCategoryTree = (categories: any[], level = 0) => {
    return categories.map((category) => (
      <div key={category.id} className="space-y-2">
        <div 
          className="flex items-center justify-between p-3 border rounded-lg"
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="flex items-center gap-3">
            {category.children?.length > 0 ? (
              <FolderOpen className="h-4 w-4 text-primary" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                {!category.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground">{category.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteMutation.mutate(category.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {category.children?.length > 0 && (
          <div>
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryTree = buildCategoryTree(categories || []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trees className="h-5 w-5" />
              Product Categories
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingCategory(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory 
                      ? 'Update the category information below.'
                      : 'Add a new category to organize your products.'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Fertilizers"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the category"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent_id">Parent Category</Label>
                    <select
                      id="parent_id"
                      value={formData.parent_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">No Parent (Top Level)</option>
                      {categories?.filter(cat => cat.id !== editingCategory?.id).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sort_order">Sort Order</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingCategory ? 'Update' : 'Create'} Category
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Organize your products into hierarchical categories for better navigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryTree.length > 0 ? (
              renderCategoryTree(categoryTree)
            ) : (
              <div className="text-center py-12">
                <Trees className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first category to organize your products.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Category
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}