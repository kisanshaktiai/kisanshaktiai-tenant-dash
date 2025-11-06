import { useState, useMemo } from 'react';
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
  Folder,
  LayoutGrid,
  List,
  Search,
  TrendingUp,
  Package,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
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

  const buildCategoryTree = (categories: Category[], parentId: string | null = null): any[] => {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(categories, cat.id)
      }));
  };

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!searchQuery.trim()) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(query) ||
      cat.description?.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const renderCategoryCard = (category: any) => (
    <Card 
      key={category.id} 
      className="group relative overflow-hidden hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
    >
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg transition-colors ${
              category.children?.length > 0 
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {category.children?.length > 0 ? (
                <FolderOpen className="h-5 w-5" />
              ) : (
                <Folder className="h-5 w-5" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              {category.children?.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {category.children.length} subcategories
                </p>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
              <DropdownMenuItem onClick={() => handleEdit(category)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem>
                {category.is_active ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => deleteMutation.mutate(category.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {category.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {category.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              <span>0 products</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Order: {category.sort_order}</span>
            </div>
          </div>
          
          <Badge 
            variant={category.is_active ? "default" : "secondary"}
            className="text-xs"
          >
            {category.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderCategoryList = (category: any, level = 0) => (
    <div key={category.id} className="space-y-2">
      <div 
        className="group relative flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-soft transition-all duration-200"
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-2 rounded-md transition-colors ${
            category.children?.length > 0 
              ? 'bg-primary/10 text-primary' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {category.children?.length > 0 ? (
              <FolderOpen className="h-4 w-4" />
            ) : (
              <Folder className="h-4 w-4" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{category.name}</h4>
              <Badge 
                variant={category.is_active ? "default" : "secondary"}
                className="text-xs shrink-0"
              >
                {category.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {category.description && (
              <p className="text-xs text-muted-foreground truncate">
                {category.description}
              </p>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              <span>0 products</span>
            </div>
            {category.children?.length > 0 && (
              <div className="flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5" />
                <span>{category.children.length} subs</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>#{category.sort_order}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(category)}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate(category.id)}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {category.children?.length > 0 && (
        <div className="space-y-2">
          {category.children.map((child: any) => renderCategoryList(child, level + 1))}
        </div>
      )}
    </div>
  );

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

  const categoryTree = buildCategoryTree(filteredCategories);

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-soft">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Trees className="h-5 w-5 text-primary" />
                </div>
                Product Categories
              </CardTitle>
              <CardDescription className="mt-2">
                Organize your products into hierarchical categories for better navigation
              </CardDescription>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingCategory(null)} size="lg" className="shadow-soft">
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
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg shrink-0">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8"
              >
                <List className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground">Total Categories</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {categories?.length || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {categories?.filter(c => c.is_active).length || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground">Top Level</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {categories?.filter(c => !c.parent_id).length || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground">Subcategories</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {categories?.filter(c => c.parent_id).length || 0}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {categoryTree.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-3'
            }>
              {viewMode === 'grid' 
                ? categoryTree.map(renderCategoryCard)
                : categoryTree.map(cat => renderCategoryList(cat, 0))
              }
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Trees className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No categories found' : 'No categories yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {searchQuery 
                  ? `No categories match "${searchQuery}". Try a different search.`
                  : 'Create your first category to organize your products effectively.'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsDialogOpen(true)} size="lg" className="shadow-soft">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Category
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}