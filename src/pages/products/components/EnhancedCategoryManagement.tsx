
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trees, 
  Plus, 
  Edit, 
  Trash2, 
  FolderOpen,
  Folder,
  Search,
  Filter,
  Upload,
  Download,
  ArrowUp,
  ArrowDown,
  Settings,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  icon_url: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  product_count?: number;
  children?: Category[];
}

export default function EnhancedCategoryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getTenantId } = useTenantIsolation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    is_active: true,
    sort_order: 0,
    icon_url: ''
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', getTenantId()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select(`
          *,
          product_count:products(count)
        `)
        .eq('tenant_id', getTenantId())
        .order('sort_order', { ascending: true });
      if (error) throw error;
      
      // Transform the data to match our interface
      return data.map(category => ({
        ...category,
        product_count: Array.isArray(category.product_count) ? category.product_count.length : 0
      })) as Category[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('product_categories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_categories',
          filter: `tenant_id=eq.${getTenantId()}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['categories', getTenantId()] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getTenantId, queryClient]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { error } = await supabase
        .from('product_categories')
        .insert([{ 
          ...data, 
          slug,
          parent_id: data.parent_id || null,
          tenant_id: getTenantId()
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
        .eq('id', data.id)
        .eq('tenant_id', getTenantId());
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
        .eq('id', id)
        .eq('tenant_id', getTenantId());
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

  const reorderMutation = useMutation({
    mutationFn: async ({ categoryId, newOrder }: { categoryId: string, newOrder: number }) => {
      const { error } = await supabase
        .from('product_categories')
        .update({ sort_order: newOrder })
        .eq('id', categoryId)
        .eq('tenant_id', getTenantId());
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parent_id: '',
      is_active: true,
      sort_order: 0,
      icon_url: ''
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
      sort_order: category.sort_order,
      icon_url: category.icon_url || ''
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

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const moveCategory = (categoryId: string, direction: 'up' | 'down') => {
    const category = categories?.find(c => c.id === categoryId);
    if (!category) return;

    const newOrder = direction === 'up' ? category.sort_order - 1 : category.sort_order + 1;
    reorderMutation.mutate({ categoryId, newOrder });
  };

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);
      
      return (
        <div key={category.id} className="space-y-1">
          <div 
            className={cn(
              "group flex items-center justify-between p-3 rounded-lg transition-all duration-200",
              "hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/40",
              "border border-transparent hover:border-primary/20",
              !category.is_active && "opacity-60"
            )}
            style={{ marginLeft: `${level * 20}px` }}
          >
            <div className="flex items-center gap-3 flex-1">
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(category.id)}
                  className={cn(
                    "p-1.5 h-auto rounded-md transition-all duration-200",
                    "hover:bg-primary/10 hover:scale-110"
                  )}
                >
                  {isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-primary" />
                  ) : (
                    <Folder className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  )}
                </Button>
              ) : (
                <div className="w-9 flex justify-center">
                  <Folder className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                  {!category.is_active && (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                  {category.product_count && category.product_count > 0 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs font-semibold group-hover:border-primary group-hover:text-primary transition-colors"
                    >
                      {category.product_count} products
                    </Badge>
                  )}
                </div>
                {category.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveCategory(category.id, 'up')}
                disabled={category.sort_order === 0}
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveCategory(category.id, 'down')}
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-primary/10"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem 
                    onClick={() => handleEdit(category)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => deleteMutation.mutate(category.id)}
                    className="text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="animate-fade-in">
              {renderCategoryTree(category.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const categoryTree = buildCategoryTree(filteredCategories || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trees className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl">Product Categories</h2>
                <p className="text-sm text-muted-foreground font-normal mt-0.5">
                  Organize your products into hierarchical categories
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-primary/5 hover:border-primary transition-all"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-primary/5 hover:border-primary transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setEditingCategory(null)}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader className="border-b pb-4 bg-gradient-to-r from-primary/5 to-transparent -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl">
                          {editingCategory ? 'Edit Category' : 'Create New Category'}
                        </DialogTitle>
                        <DialogDescription className="mt-1">
                          {editingCategory 
                            ? 'Update the category information below.'
                            : 'Add a new category to organize your products.'
                          }
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold">
                          Category Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Fertilizers"
                          required
                          className="border-2 focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parent_id" className="text-sm font-semibold">
                          Parent Category
                        </Label>
                        <select
                          id="parent_id"
                          value={formData.parent_id}
                          onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                          className={cn(
                            "w-full px-3 py-2 border-2 border-input bg-background rounded-lg text-sm",
                            "focus:border-primary focus:outline-none transition-colors"
                          )}
                        >
                          <option value="">No Parent (Top Level)</option>
                          {categories?.filter(cat => cat.id !== editingCategory?.id).map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the category"
                        rows={3}
                        className="border-2 focus:border-primary transition-colors resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sort_order" className="text-sm font-semibold">
                          Sort Order
                        </Label>
                        <Input
                          id="sort_order"
                          type="number"
                          value={formData.sort_order}
                          onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                          className="border-2 focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="icon_url" className="text-sm font-semibold">
                          Icon URL
                        </Label>
                        <Input
                          id="icon_url"
                          value={formData.icon_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, icon_url: e.target.value }))}
                          placeholder="Optional icon URL"
                          className="border-2 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-center justify-between p-4 rounded-lg",
                      "bg-gradient-to-r from-primary/5 to-transparent border border-primary/20"
                    )}>
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="is_active" className="text-sm font-semibold cursor-pointer">
                          Active Status
                        </Label>
                      </div>
                      <Badge variant={formData.is_active ? "default" : "secondary"}>
                        {formData.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <DialogFooter className="border-t pt-4 gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={resetForm}
                        className="hover:bg-destructive/5 hover:border-destructive transition-all"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all"
                      >
                        {createMutation.isPending || updateMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingCategory ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            {editingCategory ? 'Update' : 'Create'} Category
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 focus:border-primary transition-colors h-10"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="hover:bg-primary/5 hover:border-primary transition-all h-10"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Tree */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="space-y-2">
            {categoryTree.length > 0 ? (
              renderCategoryTree(categoryTree)
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
                  <Trees className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? 'No categories match your search.' : 'Create your first category to organize your products.'}
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all"
                >
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
